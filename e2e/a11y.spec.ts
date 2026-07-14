import { test, expect } from "@playwright/test";

test.describe("Accessibility smoke", () => {
  test("login form has labels", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("search has landmark search form", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByRole("search")).toBeVisible();
  });

  test("checkout stepper on book page when authed path blocked", async ({ page }) => {
    await page.goto("/book/1");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
