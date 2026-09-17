import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * Two projects, per SPEC §10: a phone (the primary device) and a desktop viewport.
 * Runs against the exported static build served by scripts/serve-dist.mjs, which is what
 * production serves too. Browsers install into .playwright/ (PLAYWRIGHT_BROWSERS_PATH in .env).
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
      use: {
        ...devices["iPhone 14"],
        viewport: { width: 390, height: 844 },
        colorScheme: "light",
      },
    },
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
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
