import { test, expect } from "@playwright/test";

test.describe("Auth journeys", () => {
  test("login page links to signup", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("link", { name: /Create account|Sign up/i })).toBeVisible();
  });

  test("signup page links to login", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("link", { name: /Sign in/i })).toBeVisible();
  });

  test("protected platform redirects anonymous to login", async ({ page }) => {
    await page.goto("/platform");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
    expect(page.url()).toContain("next=%2Fplatform");
  });

  test("protected org redirects anonymous to login", async ({ page }) => {
    await page.goto("/org");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
    expect(page.url()).toContain("next=%2Forg");
  });

  test("driver map is public", async ({ page }) => {
    await page.goto("/driver");
    await expect(page.getByTestId("driver-map")).toBeVisible();
    await expect(page.getByPlaceholder("Where to park?")).toBeVisible();
  });
});
