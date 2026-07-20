# Example NodeJS/React Consumer - playwright (BYO Adapter)

[![Build](https://github.com/pactflow/example-bi-directional-consumer-playwright-js/actions/workflows/build.yml/badge.svg)](https://github.com/pactflow/example-bi-directional-consumer-playwright-js/actions/workflows/build.yml)

[![Can I deploy Status](https://testdemo.pactflow.io/pacticipants/pactflow-example-bi-directional-consumer-playwright-js/branches/main/latest-version/can-i-deploy/to-environment/production/badge)](https://testdemo.pactflow.io/pacticipants/pactflow-example-bi-directional-consumer-playwright-js/branches/main/latest-version/can-i-deploy/to-environment/production/badge)

- [Example NodeJS/React Consumer - playwright (BYO Adapter)](#example-nodejsreact-consumer---playwright-byo-adapter)
  - [Overview of Example](#overview-of-example)
    - [Key points with Playwright](#key-points-with-playwright)
  - [Overview of Part of Bi-Directional Contract Testing Flow](#overview-of-part-of-bi-directional-contract-testing-flow)
  - [Compatible with Providers](#compatible-with-providers)
  - [Pre-requisites](#pre-requisites)
    - [Environment variables](#environment-variables)
  - [Usage](#usage)
    - [Steps](#steps)
    - [Writing a Playwright spec that generates a contract](#writing-a-playwright-spec-that-generates-a-contract)
  - [OS/Platform specific considerations](#osplatform-specific-considerations)
  - [Caveats](#caveats)
  - [Related topics / posts / discussions](#related-topics--posts--discussions)
  - [Other examples of how to do this form of testing](#other-examples-of-how-to-do-this-form-of-testing)
  - [Found an issue?](#found-an-issue)

## Overview of Example

<!-- Consumer Overview -->

This is an example of a React "Product" API consumer that uses Playwright & [Pactflow](https://pactflow.io) and GitHub Actions to generate and publish Pact consumer contracts.

It performs pre-deployment cross-compatibility checks to ensure that it is compatible with specified providers using the Bi-Directional contract capability of Pactflow.

<!-- General -->

See the full [Pactflow Bi-Directional Workshop](https://docs.pactflow.io/docs/workshops/bi-directional-contract-testing) for which this can be substituted in as the "consumer".

### Key points with Playwright

Unlike the Pact-native consumer examples, this project has no Pact mock-provider
library in the loop. Instead it demonstrates the "bring your own adapter"
pattern:

- It's a React app implementing a "Product" website, built with Vite and
  TypeScript.
- Playwright drives the app end-to-end in a real browser and intercepts every
  outbound request to the provider API with [`page.route()`](https://playwright.dev/docs/api/class-page#page-route).
- `test/playwrightSerialiser.ts` is a small, hand-written adapter — not a Pact
  library — that converts each intercepted request/response exchange into a
  Pact interaction and appends it to a contract file under `pacts/`.
  - Interactions are deduplicated by their generated `description` (method,
    path, status and query string): the first interaction with a given
    description wins, later ones with the same description are dropped. Pass
    `keepDupeDescs: true` to keep every interaction instead, including
    duplicates.
  - A small `AUTOGEN_HEADER_BLOCKLIST` strips headers that Playwright or the
    browser attach and that carry no contract meaning (`user-agent`,
    `sec-fetch-*`, `accept-encoding`, `date`, `connection`,
    `cache-control`, `pragma`, and similar), so the published contract only
    asserts on headers the application itself cares about.

Because the contract is assembled by hand rather than recorded by a Pact
mock server, this example is a template for teams using an HTTP testing tool
that has no native Pact integration: the same pattern — intercept, transform,
write — works for any framework that can intercept outbound requests.

## Overview of Part of Bi-Directional Contract Testing Flow

<!-- Consumer Overview -->

In the following diagram, You can see how the consumer testing process works - it's the same as the current Pact process.

When we call "can-i-deploy" the cross-contract validation process kicks off on Pactflow, to ensure any consumer consumes a valid subset of the OAS for the provider.

![Consumer Test](docs/consumer-scope.png 'Consumer Test')

The project uses a Makefile to simulate a very simple build pipeline with two stages - test and deploy.

When you run the CI pipeline (see below for doing this), the pipeline should perform the following activities (simplified):

- Test
  - Run tests (including the pact tests that generate the contract)
  - Publish pacts, tagging the consumer version with the name of the current branch
  - Check if we are safe to deploy to Production with `can-i-deploy` (ie. has the cross-contract validation has been successfully performed)
- Deploy (only from <main|master>)
  - Deploy app to Production
  - Record the Production deployment in the Pact Broker

![Consumer Pipeline](docs./../docs/consumer-pipeline.png 'Consumer Pipeline')

## Compatible with Providers

<!-- Provider Compatability -->

This project is currently compatible with the following provider(s):

- [pactflow-example-bi-directional-provider-dredd](https://github.com/pactflow/example-bi-directional-provider-dredd)
- [pactflow-example-bi-directional-provider-restassured](https://github.com/pactflow/example-provider-restassured)
- [pactflow-example-bi-directional-provider-postman](https://github.com/pactflow/example-bi-directional-provider-postman)
<!-- * [pactflow-example-bi-directional-provider-dotnet](https://github.com/pactflow/example-bi-directional-provider-dotnet) -->

See [Environment variables](#environment-variables) on how to set these up.

## Pre-requisites

**Software**:

- [Node.js 24](https://nodejs.org/) (LTS) or later
- Tools listed at: https://docs.pactflow.io/docs/workshops/ci-cd/set-up-ci/prerequisites/
- A pactflow.io account with an valid [API token](https://docs.pactflow.io/docs/getting-started/#configuring-your-api-token)

Install dependencies with `npm ci` (or `make install`, which does the same
thing).

### Environment variables

To be able to run some of the commands locally, you will need to export the following environment variables into your shell, or copy [`.env.example`](.env.example) to `.env` and fill it in:

- `VITE_API_BASE_URL`: the base URL of the provider API. Playwright intercepts
  every request to this origin, so nothing actually listens here during a
  test run — but the value must match `src/api.ts`, the specs, the Makefile
  and CI, or interception silently misses and no contract is written.
  Defaults to `http://localhost:8080`.
- `PACT_BROKER_TOKEN`: a valid [API token](https://docs.pactflow.io/docs/getting-started/#configuring-your-api-token) for Pactflow
- `PACT_BROKER_BASE_URL`: a fully qualified domain name with protocol to your pact broker e.g. https://testdemo.pactflow.io

<!-- CONSUMER env vars -->

Set `PACT_PROVIDER` to one of the following

- `PACT_PROVIDER=pactflow-example-bi-directional-provider-dredd`: Dredd - (https://github.com/pactflow/example-bi-directional-provider-dredd)
- `PACT_PROVIDER=pactflow-example-bi-directional-provider-postman`: Postman - (https://github.com/pactflow/example-bi-directional-provider-postman)
- `PACT_PROVIDER=pactflow-example-bi-directional-provider-restassured`: Rest Assured - (https://github.com/pactflow/example-bi-directional-provider-restassured)

## Usage

### Steps

NOTE: Playwright tests are located in `./test`. See below for how to start
Playwright, generate the consumer contract, and publish the contract to
Pactflow.

- `make install` - install project dependencies

Run each step separately

- `make test_and_publish` - runs the Playwright tests (which generate the
  contract) and publishes the generated pact(s) to Pactflow
  - This will perform the following 2 calls
    - `make test`
    - `make publish_pacts`
- `make can_i_deploy` - runs can-i-deploy to check if its safe to deploy the consumer
- `make deploy` - deploys the app and records deployment

or run the whole lot in one go

- `make ci` - run the CI process, but locally (uses Docker by default)

Installing alternate pact CLI tools.

If you don't have docker, you can use one of the ruby tools. The standalone, doesn't require that you install Ruby on your host machine.

- `make install-pact-ruby-cli` - installs the pact ruby CLI tool
- `make install-pact-ruby-standalone` - installs the pact standalone CLI depending on your platform

Using alternate pact CLI tools.

- `PACT_TOOL=docker make ci` - run the CI process, using the pact Docker CLI tool
- `PACT_TOOL=ruby_standalone make ci` - run the CI process, using the pact standalone CLI tool
- `PACT_TOOL=ruby_cli make ci` - run the CI process, using the pact ruby CLI tool

Outside of the Makefile, the npm scripts are:

- `npm run dev` - start the Vite dev server on its own, for manual poking around
- `npm test` - run the Playwright suite. It starts the dev server itself (via
  Playwright's `webServer` option), runs every spec, and writes the generated
  contract(s) to `pacts/`. There is no separate "start the app" step.
- `npm run test:report` - open the HTML report from the last `npm test` run
- `npm run build` - type-check and build the production bundle with Vite
- `npm run preview` - preview the production build locally
- `npm run type-check` - `tsc --build` with no emit
- `npm run lint` / `npm run lint:fix` - Biome lint, with an autofix variant
- `npm run format` / `npm run format:fix` - Biome format check/write
- `npm run check` / `npm run check:fix` - Biome lint + format together

### Writing a Playwright spec that generates a contract

Look at one of the tests, e.g. `test/productByQuery.spec.ts`.

1. Import `transformPlaywrightMatchToPact` from `./playwrightSerialiser`.
2. Call it inside your Playwright [route](https://playwright.dev/docs/api/class-page#page-route) handler, after fulfilling the route.

```ts
import { transformPlaywrightMatchToPact } from "./playwrightSerialiser";

await page.route(`${API_BASE_URL}/products?id=2`, async (route) => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify(testData),
    headers: { "Content-Type": "application/json" },
  });
  await transformPlaywrightMatchToPact(route, {
    pacticipant: "pactflow-example-bi-directional-consumer-playwright-js",
    provider: process.env.PACT_PROVIDER ?? "pactflow-example-bi-directional-provider-dredd",
  });
});
```

## OS/Platform specific considerations

The makefile has been configured to run on Unix/Windows and MacOS based systems, and tested against Github Actions

They can be run locally on Unix/Windows and MacOS, or on Windows via [WSL2](https://docs.microsoft.com/en-us/windows/wsl/install) or a shell with bash.

## Caveats

- [OAS considerations](https://docs.pactflow.io/docs/bi-directional-contract-testing/contracts/oas#considerations)

## Related topics / posts / discussions

- [Consumer Side Bi-Directional Contract Testing Guide](https://docs.pactflow.io/docs/bi-directional-contract-testing/consumer)
- [Provider Side Bi-Directional Contract Testing Guide](https://docs.pactflow.io/docs/bi-directional-contract-testing/provider)

## Other examples of how to do this form of testing

- TBC

## Found an issue?

Reach out via a GitHub Issue, or reach us over in the [Pact foundation Slack](https://slack.pact.io)
