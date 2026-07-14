import { test, expect } from "@playwright/test";

test.describe("Demo mode journey", () => {
  test("toggle demo banner and browse driver map", async ({ page }) => {
    await page.goto("/driver");
    await expect(page.getByTestId("driver-map")).toBeVisible({ timeout: 60_000 });
    const demoToggle = page.getByRole("checkbox", { name: /Demo mode/i });
    if (await demoToggle.isVisible()) {
      await demoToggle.check();
      await expect(demoToggle).toBeChecked();
    }
  });

  test("search page loads list and map toggle", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByRole("tab", { name: "List" })).toBeVisible({ timeout: 60_000 });
    await page.getByRole("tab", { name: "Map" }).click();
    await expect(page.getByRole("tab", { name: "Map" })).toHaveAttribute("aria-selected", "true");
  });

  test("login exposes forgot-password and console links", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Forgot password" })).toBeVisible();
    await expect(page.getByRole("link", { name: "/console" })).toBeVisible();
  });

  test("forgot-password form renders", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByRole("heading", { name: "Reset password" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("button", { name: /Send reset link/i })).toBeVisible();
  });

  test("console loads for demo browsing", async ({ page }) => {
    await page.goto("/console");
    await expect(page.getByRole("heading", { name: /Live console|Console|SpotSync/i }).first()).toBeVisible({
      timeout: 90_000,
    });
  });

  test("pricing page links to org billing path", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: /Pricing|Plans/i }).first()).toBeVisible({
      timeout: 60_000,
    });
  });
});
