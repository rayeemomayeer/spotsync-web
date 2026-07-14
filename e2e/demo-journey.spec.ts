import { test, expect } from "@playwright/test";

test.describe("Demo mode journey", () => {
  test("toggle demo banner and browse driver map", async ({ page }) => {
    await page.goto("/driver");
    await expect(page.getByTestId("driver-map")).toBeVisible();
    const demoToggle = page.getByRole("checkbox", { name: /Demo mode/i });
    if (await demoToggle.isVisible()) {
      await demoToggle.check();
      await expect(demoToggle).toBeChecked();
    }
  });

  test("search page loads list and map toggle", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByRole("tab", { name: "List" })).toBeVisible();
    await page.getByRole("tab", { name: "Map" }).click();
    await expect(page.getByRole("tab", { name: "Map" })).toHaveAttribute("aria-selected", "true");
  });
});
