import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testIgnore: "security.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: process.env.SHOWCASE_BASE_URL || "http://127.0.0.1:5174",
    viewport: { width: 1440, height: 900 },
  },
  webServer: process.env.SHOWCASE_BASE_URL ? undefined : {
    command: "npm run preview -- --host 127.0.0.1 --port 5174 --strictPort",
    url: "http://127.0.0.1:5174",
    reuseExistingServer: true,
  },
});
