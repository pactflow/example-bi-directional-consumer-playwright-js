import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Route } from "@playwright/test";

// Headers deliberately excluded from the published contract. Most of these
// are transport/session details that Playwright or the browser attaches and
// that carry no contract meaning. connection, cache-control and pragma are
// included defensively: none of chromium, firefox or webkit currently emits
// them (verified in isolation, not merely as an artefact of one engine
// winning a race), but nothing guarantees a future Playwright or browser
// version won't reintroduce them, and their presence would make the contract
// fail verification against a provider that never sends them. The
// application's own `authorization` header is deliberately not blocked here:
// it embeds the current ISO timestamp (see src/api.ts), so it still varies
// from run to run — the one remaining source of non-determinism in the
// published contract.
const AUTOGEN_HEADER_BLOCKLIST = new Set([
  "access-control-expose-headers",
  "access-control-allow-credentials",
  "vary",
  "host",
  "proxy-connection",
  "sec-ch-ua",
  "sec-ch-ua-mobile",
  "user-agent",
  "sec-ch-ua-platform",
  "origin",
  "sec-fetch-site",
  "sec-fetch-mode",
  "sec-fetch-dest",
  "referer",
  "accept-encoding",
  "accept-language",
  "date",
  "x-powered-by",
  "connection",
  "cache-control",
  "pragma",
]);

interface PactInteraction {
  description: string;
  request: {
    method: string;
    path: string;
    body?: unknown;
    query?: string;
    headers: Record<string, string>;
  };
  response: {
    status?: number;
    headers: Record<string, string>;
    body?: unknown;
  };
}

interface Pact {
  consumer: { name: string };
  provider: { name: string };
  interactions: PactInteraction[];
  metadata: {
    pactSpecification: { version: string };
    client: { name: string; version: string };
  };
}

interface SerialiserOptions {
  pacticipant: string;
  provider: string;
  /**
   * Keep every interaction, including ones sharing a description. Turn this
   * on when the same method/path/status/query can legitimately produce
   * different response bodies (e.g. paginated or randomised responses) and
   * each variant needs its own interaction in the contract.
   */
  keepDupeDescs?: boolean;
}

const omitBlockedHeaders = (
  headers: Record<string, string>,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(headers).filter(
      ([name]) => !AUTOGEN_HEADER_BLOCKLIST.has(name.toLowerCase()),
    ),
  );

const dedupeInteractions = (pact: Pact): Pact => {
  const seen = new Set<string>();
  return {
    ...pact,
    interactions: pact.interactions.filter((interaction) => {
      if (seen.has(interaction.description)) {
        return false;
      }
      seen.add(interaction.description);
      return true;
    }),
  };
};

const writePact = (
  pact: Pact,
  filePath: string,
  keepDupeDescs: boolean,
): void => {
  mkdirSync(dirname(filePath), { recursive: true });
  const output = keepDupeDescs ? pact : dedupeInteractions(pact);
  writeFileSync(filePath, JSON.stringify(output));
};

const readPactOrDefault = (filePath: string, fallback: Pact): Pact => {
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as Pact;
  } catch {
    return fallback;
  }
};

const transformPlaywrightMatchToPact = async (
  route: Route,
  opts: SerialiserOptions,
): Promise<void> => {
  const { pacticipant, provider, keepDupeDescs = false } = opts;
  const filePath = join("pacts", `${pacticipant}-${provider}.json`);

  const request = route.request();
  const url = new URL(request.url());
  const response = await request.response();
  const responseBody = await response?.body();
  const query = url.searchParams.toString();

  const interaction: PactInteraction = {
    description: `pw_${request.method()}_${url.pathname}_${response?.status()}${
      query ? `_${query}` : ""
    }`,
    request: {
      method: request.method(),
      path: url.pathname,
      body: request.postDataJSON() ?? undefined,
      query: query || undefined,
      headers: omitBlockedHeaders(request.headers()),
    },
    response: {
      status: response?.status(),
      headers: omitBlockedHeaders(response?.headers() ?? {}),
      body: responseBody ? JSON.parse(responseBody.toString()) : undefined,
    },
  };

  const pact = readPactOrDefault(filePath, {
    consumer: { name: pacticipant },
    provider: { name: provider },
    interactions: [],
    metadata: {
      pactSpecification: { version: "2.0.0" },
      client: { name: "pact-playwright-js", version: "0.0.1" },
    },
  });

  const updatedPact = {
    ...pact,
    interactions: [...pact.interactions, interaction],
  };

  writePact(updatedPact, filePath, keepDupeDescs);
};

export type { Pact, PactInteraction, SerialiserOptions };
export { transformPlaywrightMatchToPact };
