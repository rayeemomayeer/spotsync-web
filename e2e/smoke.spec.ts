import { test, expect } from "@playwright/test";

test.describe("Live Console smoke", () => {
  test("loads console shell", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Live Console")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Zones" })).toBeVisible();
  });

  test("demo driver can open reserve panel", async ({ page }) => {
    test.skip(!process.env.SPOTSYNC_E2E_API, "Set SPOTSYNC_E2E_API=1 with backend running");

    await page.goto("/");
    await page.getByRole("button", { name: "Demo Driver" }).click();
    await expect(page.getByRole("heading", { name: "Reserve" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Demo reserve|Reserve spot/ })).toBeVisible();
  });
});
