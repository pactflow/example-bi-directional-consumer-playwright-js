import process from "node:process";

export const API_BASE_URL =
  process.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export const PACTICIPANT =
  "pactflow-example-bi-directional-consumer-playwright-js";

export const PROVIDER =
  process.env.PACT_PROVIDER ?? "pactflow-example-bi-directional-provider-dredd";
