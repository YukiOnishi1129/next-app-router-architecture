import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    css: {
      modules: {
        classNameStrategy: "non-scoped",
      },
    },
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        ".next/",
        "next.config.ts",
        "postcss.config.mjs",
        "tailwind.config.ts",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData.ts",
        "src/stories/**",
      ],
    },
    exclude: ["node_modules", ".next", "dist", "cypress", "e2e"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
