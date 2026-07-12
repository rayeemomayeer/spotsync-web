import { test, expect } from "@playwright/test";

test.describe("Marketing + theme", () => {
  test("landing shows SpotSync brand and CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "SpotSync" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Sign in \/ Get started/i })).toBeVisible();
  });

  test("theme toggle flips html dark class", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByTestId("theme-toggle");
    await expect(toggle).toBeVisible();
    const before = await page.locator("html").getAttribute("class");
    await toggle.click();
    const after = await page.locator("html").getAttribute("class");
    expect(before === after).toBe(false);
    expect(after?.includes("dark") || after?.includes("light")).toBe(true);
  });
});

test.describe("Live Console smoke", () => {
  test("loads console shell", async ({ page }) => {
    await page.goto("/console");
    await expect(page.getByText("Live Console")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Zones" })).toBeVisible();
  });

  test("demo driver can open reserve panel", async ({ page }) => {
    test.skip(!process.env.SPOTSYNC_E2E_API, "Set SPOTSYNC_E2E_API=1 with backend running");

    await page.goto("/console");
    await page.getByRole("button", { name: "Demo Driver" }).click();
    await expect(page.getByRole("heading", { name: "Reserve" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Demo reserve|Reserve spot/ })).toBeVisible();
  });
});
