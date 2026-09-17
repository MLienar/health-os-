import { expect, test } from "@playwright/test";

// Runs only in the `pwa` project (Chromium with the phone viewport): Playwright can only observe
// service workers reliably in Chromium, and WebKit's offline emulation does not cover them.
test.describe("pwa", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "service worker checks need Chromium");

  test("manifest is served and describes a standalone app", async ({ request }) => {
    const res = await request.get("/manifest.json");
    expect(res.ok()).toBeTruthy();
    const manifest = await res.json();
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons.map((i: { sizes: string }) => i.sizes)).toEqual(
      expect.arrayContaining(["192x192", "512x512"]),
    );
    for (const icon of manifest.icons as { src: string }[]) {
      expect((await request.get(icon.src)).ok()).toBeTruthy();
    }
  });

  test("index.html carries the install metadata", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/manifest.json");
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
    await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute(
      "content",
      "yes",
    );
    await expect(page.locator('meta[name="theme-color"]')).toHaveCount(2);
  });

  test("shell opens offline after one online visit", async ({ page, context }, testInfo) => {
    await page.goto("/");
    await expect(page.getByTestId("today.root")).toBeVisible();
    // Wait until the worker controls the page and has finished precaching.
    await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller) {
        await new Promise<void>((resolve) =>
          navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), {
            once: true,
          }),
        );
      }
      return reg.active?.state;
    });
    const cacheNames = await page.evaluate(() => caches.keys());
    expect(cacheNames.some((n) => n.startsWith("health-os-"))).toBeTruthy();

    await context.setOffline(true);
    await page.goto("/diary");
    await expect(page.getByTestId("diary.root")).toBeVisible();
    await page.screenshot({
      path: `../../.playwright/shots/${testInfo.project.name}-offline-diary.png`,
    });
    await context.setOffline(false);
  });
});
