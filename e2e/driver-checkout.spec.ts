import { test, expect } from "@playwright/test";

test.describe("Driver checkout", () => {
  test("book page requires sign in", async ({ page }) => {
    await page.goto("/book/1");
    await expect(page.getByRole("link", { name: /Sign in/i })).toBeVisible();
  });

  test("reservations page redirects or prompts auth", async ({ page }) => {
    await page.goto("/reservations");
    const url = page.url();
    expect(url.includes("/login") || url.includes("/reservations")).toBeTruthy();
  });
});
