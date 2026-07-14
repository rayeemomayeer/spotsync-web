import { test, expect } from "@playwright/test";

const ORG_ADMIN = {
  id: 2,
  name: "Org Admin",
  email: "org@spotsync.com",
  role: "org_admin",
  created_at: "",
  updated_at: "",
};

async function stubOrgAdmin(page: import("@playwright/test").Page, org: Record<string, unknown>) {
  await page.route("**/api/v1/auth/me**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, message: "ok", data: ORG_ADMIN }),
    });
  });
  await page.route("**/api/v1/orgs/me**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, message: "ok", data: org }),
    });
  });
  await page.route("**/api/v1/zones**", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, message: "ok", data: [] }),
    });
  });
  await page.addInitScript((user) => {
    localStorage.setItem("spotsync_user", JSON.stringify(user));
    localStorage.setItem("spotsync_token", "e2e-fake-token");
  }, ORG_ADMIN);
}

test.describe("Org entitlement banner", () => {
  test("pending org shows blocked zone create messaging", async ({ page }) => {
    await stubOrgAdmin(page, {
      id: 99,
      name: "Pending Garage",
      slug: "pending-garage",
      status: "pending",
      billing_plan: null,
      created_at: "",
      updated_at: "",
    });

    await page.goto("/org/zones");
    await expect(page.getByText(/Waiting for platform approval/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: /Create zone/i })).toBeDisabled();
  });

  test("active org without plan points to billing", async ({ page }) => {
    await stubOrgAdmin(page, {
      id: 7,
      name: "Unpaid Garage",
      slug: "unpaid",
      status: "active",
      billing_plan: null,
      created_at: "",
      updated_at: "",
    });

    await page.goto("/org/zones");
    await expect(page.getByText(/Subscription required/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("link", { name: /Choose a plan/i })).toHaveAttribute(
      "href",
      "/org/billing",
    );
  });
});
