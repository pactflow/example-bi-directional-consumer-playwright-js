import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    // Playwright's webServer waits on this exact port; silently falling back to
    // another one would hang the test run instead of failing fast.
    strictPort: true,
  },

  preview: {
    port: 3000,
    strictPort: true,
  },

  build: {
    outDir: "build",
    sourcemap: true,
  },

  // Only VITE_-prefixed vars are exposed to the client bundle. The Pact
  // tooling (test/pactOptions.ts, playwright.config.ts) runs in Node and
  // reads process.env directly, so it needs no entry here — and PACT_BROKER_TOKEN
  // must never be added, since that would ship it to the browser.
  envPrefix: ["VITE_"],
});
