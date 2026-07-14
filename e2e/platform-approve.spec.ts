import { test, expect } from "@playwright/test";

test.describe("Platform admin", () => {
  test("platform overview redirects anonymous users", async ({ page }) => {
    await page.goto("/platform");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("next=%2Fplatform");
  });

  test("platform orgs queue page exists behind auth", async ({ page }) => {
    await page.goto("/platform/orgs");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });
});
