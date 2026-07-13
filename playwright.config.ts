import { defineConfig, devices } from "@playwright/test";

const port = process.env.PLAYWRIGHT_PORT ?? "3005";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${port}`;
const againstProd = Boolean(process.env.PLAYWRIGHT_BASE_URL);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: againstProd ? 1 : 0,
  timeout: againstProd ? 60_000 : 30_000,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: againstProd
    ? undefined
    : {
        command: process.env.CI
          ? `npx next start -p ${port}`
          : `npx next dev -p ${port}`,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120000,
      },
});
