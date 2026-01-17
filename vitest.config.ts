import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [],
    include: ["packages/**/__tests__/**/*.{test,spec}.{js,ts,tsx}"],
  },
  resolve: {
    alias: {
      "@iot/utils": path.resolve(__dirname, "packages/utils/src"),
      "@iot/animation": path.resolve(__dirname, "packages/animation/src"),
      "@iot/compute": path.resolve(__dirname, "packages/compute/src"),
      "@iot/three-utils": path.resolve(__dirname, "packages/three-utils/src"),
      "@iot/canvas": path.resolve(__dirname, "packages/canvas/src"),
      "@iot/ui": path.resolve(__dirname, "packages/ui/src"),
      "@iot/charts": path.resolve(__dirname, "packages/charts/src"),
      "@iot/test-utils": path.resolve(__dirname, "packages/test-utils/src"),
    },
  },
});
