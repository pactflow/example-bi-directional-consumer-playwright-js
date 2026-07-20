import process from "node:process";
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Playwright's config runs in Node and does not benefit from Vite's own .env
// loading, so it reads the file itself.
dotenv.config();

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./test",
  timeout: 30_000,
  expect: { timeout: 5000 },

  // Every spec appends to the same pact file, so contract generation is
  // inherently serial. Parallel workers race on read-modify-write and can drop
  // interactions.
  fullyParallel: false,
  workers: 1,

  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "html",

  use: {
    // biome-ignore lint/style/useNamingConvention: "baseURL" is Playwright's own option name and cannot be re-cased.
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],

  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
