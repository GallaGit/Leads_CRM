import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    pool: "threads",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      // Thresholds are goals in TEST_PLAN; enforce as coverage grows.
      include: [
        "src/lib/domain/lead.ts",
        "src/lib/geo/cities.ts",
        "src/lib/ai/pain-analysis.ts",
        "src/lib/leads/**/*.ts",
        "src/lib/utils/email-plain.ts",
      ],
      exclude: [
        "node_modules/",
        "src/**/*.d.ts",
        "src/**/*.test.{ts,tsx}",
        "vitest.setup.ts",
        ".next/",
        "dist/",
      ],
    },
    globals: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
});
