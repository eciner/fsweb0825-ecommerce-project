import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.js",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60000,
  reporter: "list",
  globalSetup: "./e2e/local-stack.js",
  use: {
    baseURL: "http://127.0.0.1:5176",
    channel: "msedge",
    headless: true,
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  webServer: {
    command: "npm.cmd run dev -- --host 127.0.0.1 --port 5176 --strictPort",
    url: "http://127.0.0.1:5176",
    reuseExistingServer: false,
    env: { VITE_API_URL: "http://127.0.0.1:8083" },
  },
});
