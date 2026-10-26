import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3100);
const baseURL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

/**
 * Smoke tests run against a production build. `npm run test:e2e` builds and starts the app
 * (or reuses one already running on the port). Forms use the console lead provider, so no
 * email is sent.
 *
 *   npx playwright install chromium   # once
 *   npm run test:e2e
 *   npm run qa:screenshots            # 375/768/1280/1920 screenshots into qa/screenshots
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] }, testIgnore: /screenshots\.spec/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /smoke\.spec/ },
    { name: "screenshots", use: { ...devices["Desktop Chrome"] }, testMatch: /screenshots\.spec/ },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 300_000,
    env: { LEAD_PROVIDER: "console", BLOB_READ_WRITE_TOKEN: "" },
  },
});
