import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    clearMocks: true,
    restoreMocks: true,
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://test:test@localhost:5432/test_db"
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "coverage",
      include: ["src/**/*.js"],
      exclude: ["src/server.js", "src/seeds/**", "src/db/**"]
    },
    include: [
      "src/**/*.test.js",
      "src/**/*.spec.js",
      "__tests__/**/*.test.js"
    ],
    testTimeout: 10000
  }
});
