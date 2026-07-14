import { test, expect } from "@playwright/test";

test.describe("Visual reskin baselines", () => {
  test("landing warm minimal layout", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Know before you go/i })).toBeVisible();
    await expect(page).toHaveScreenshot("landing.png", { fullPage: true, maxDiffPixelRatio: 0.05 });
  });

  test("search page layout", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByRole("heading", { name: /All parking zones|Results for/i })).toBeVisible();
    await expect(page).toHaveScreenshot("search.png", { fullPage: true, maxDiffPixelRatio: 0.05 });
  });

  test("login page layout", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page).toHaveScreenshot("login.png", { fullPage: true, maxDiffPixelRatio: 0.05 });
  });
});
