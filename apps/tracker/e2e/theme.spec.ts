import { expect, type Page, test } from "@playwright/test";

/** Relative luminance of a `rgb(a)(...)` string, 0 = black, 255 = white. */
async function backgroundLuminance(page: Page, testId: string) {
  const color = await page
    .getByTestId(testId)
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  const m = color.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
  const [r = 0, g = 0, b = 0] = m;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// The `desktop` and `pwa` projects emulate a dark OS preference, `iphone` emulates light.
test.describe("theme", () => {
  test("follows the emulated system preference by default", async ({ page }, testInfo) => {
    const prefersDark = testInfo.project.use.colorScheme === "dark";
    await page.goto("/");
    await expect(page.getByTestId("today.root")).toBeVisible();
    const lum = await backgroundLuminance(page, "today.root");
    if (prefersDark) expect(lum).toBeLessThan(60);
    else expect(lum).toBeGreaterThan(200);

    // The resolved scheme reported to the app (status bar, Settings label) must agree with the CSS.
    await page.goto("/settings");
    await expect(page.getByTestId("settings.theme.resolved")).toContainText(
      prefersDark ? "Currently dark" : "Currently light",
    );
  });

  test("a forced choice wins over the system preference", async ({ page }, testInfo) => {
    const prefersDark = testInfo.project.use.colorScheme === "dark";
    await page.goto("/settings");
    // Force the opposite of the system preference and check the background flips.
    await page.getByTestId(prefersDark ? "settings.theme.light" : "settings.theme.dark").click();
    const forced = await backgroundLuminance(page, "settings.root");
    if (prefersDark) expect(forced).toBeGreaterThan(200);
    else expect(forced).toBeLessThan(60);
    // Back to system restores the OS preference.
    await page.getByTestId("settings.theme.system").click();
    const restored = await backgroundLuminance(page, "settings.root");
    if (prefersDark) expect(restored).toBeLessThan(60);
    else expect(restored).toBeGreaterThan(200);
  });
});
