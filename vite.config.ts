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

  // Vite only exposes VITE_-prefixed vars by default; PACT_ is added so Pact
  // tooling variables are readable without renaming them.
  envPrefix: ["VITE_", "PACT_"],
});
