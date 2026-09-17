import { expect, test } from "@playwright/test";

const TABS = ["today", "diary", "train", "trends", "settings"] as const;
const SHOTS = "../../.playwright/shots";

test.describe("app shell", () => {
  test("renders five tabs and navigates by URL", async ({ page }, testInfo) => {
    await page.goto("/");
    await expect(page.getByTestId("today.root")).toBeVisible();
    for (const tab of TABS) {
      await expect(page.getByTestId(`tabs.${tab}`)).toBeVisible();
    }
    await page.screenshot({ path: `${SHOTS}/${testInfo.project.name}-today.png`, fullPage: true });

    // Deep link straight to a tab: routes are the agent's navigation primitive (SPEC §10).
    await page.goto("/settings");
    await expect(page.getByTestId("settings.root")).toBeVisible();
    await expect(page.getByTestId("settings.title")).toHaveText("Settings");
  });

  test("layout matches viewport: bottom bar on phone, side rail on desktop", async ({
    page,
  }, testInfo) => {
    await page.goto("/diary");
    await expect(page.getByTestId("diary.root")).toBeVisible();
    const rail = page.getByTestId("tabs.rail");
    if (testInfo.project.name === "desktop") {
      await expect(rail).toBeVisible();
    } else {
      await expect(rail).toHaveCount(0);
    }
    await page.screenshot({ path: `${SHOTS}/${testInfo.project.name}-diary.png`, fullPage: true });
  });

  test("theme can be forced from Settings", async ({ page }, testInfo) => {
    await page.goto("/settings");
    await page.getByTestId("settings.theme.dark").click();
    await expect(page.getByTestId("settings.theme.resolved")).toContainText("dark");
    await page.screenshot({ path: `${SHOTS}/${testInfo.project.name}-settings-dark.png` });
    await page.getByTestId("settings.theme.light").click();
    await expect(page.getByTestId("settings.theme.resolved")).toContainText("light");
  });
});
