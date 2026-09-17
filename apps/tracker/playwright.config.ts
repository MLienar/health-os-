import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * Projects, per SPEC §10: a phone (the primary device, WebKit like Safari) and a desktop viewport.
 * `pwa` is Chromium at the phone viewport because Playwright can only drive service workers in
 * Chromium; it runs only e2e/pwa.spec.ts. Runs against the exported static build served by
 * scripts/serve-dist.mjs, which is what production serves too. Browsers install into
 * .playwright/browsers (PLAYWRIGHT_BROWSERS_PATH, set by the package scripts).
 */
export default defineConfig({
  testDir: "./e2e",
  outputDir: "../../.playwright/results",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "iphone",
      testIgnore: /pwa\.spec\.ts/,
      use: {
        ...devices["iPhone 14"],
        viewport: { width: 390, height: 844 },
        colorScheme: "light",
      },
    },
    {
      name: "desktop",
      testIgnore: /pwa\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
        colorScheme: "dark",
      },
    },
    {
      name: "pwa",
      testMatch: /pwa\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        colorScheme: "dark",
      },
    },
  ],
  webServer: {
    command: `node scripts/serve-dist.mjs ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
