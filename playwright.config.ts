import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;

export default defineConfig({
  testDir: "./tests/e2e",
  // One at a time: the dev server stalls when several browsers hit
  // uncompiled pages at once.
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  // The dev server compiles each page on first visit, which can take a while.
  timeout: 60_000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    navigationTimeout: 45_000,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    // Pixel 7 runs on Chromium, so only one browser download is needed.
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  // Reuses the dev server if it's already running (e.g. `npm run dev`).
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
