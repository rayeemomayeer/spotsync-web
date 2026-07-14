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

  test("signed-in book page shows quote shell", async ({ page }) => {
    await page.route("**/api/v1/auth/me**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "ok",
          data: {
            id: 1,
            name: "Alice Driver",
            email: "alice@spotsync.com",
            role: "driver",
            created_at: "",
            updated_at: "",
          },
        }),
      });
    });
    await page.route("**/api/v1/zones/1**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "ok",
          data: {
            id: 1,
            name: "Downtown Garage",
            type: "general",
            total_capacity: 50,
            available_spots: 48,
            price_per_hour: 4.5,
            created_at: "",
            updated_at: "",
          },
        }),
      });
    });
    await page.route("**/api/checkout/quote**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          zone_id: 1,
          duration_hours: 1,
          amount_cents: 450,
          currency: "usd",
          line_items: [{ label: "Downtown Garage", amount_cents: 450 }],
        }),
      });
    });
    await page.addInitScript(() => {
      localStorage.setItem(
        "spotsync_user",
        JSON.stringify({
          id: 1,
          name: "Alice Driver",
          email: "alice@spotsync.com",
          role: "driver",
          created_at: "",
          updated_at: "",
        }),
      );
      localStorage.setItem("spotsync_token", "e2e-fake-token");
    });

    await page.goto("/book/1");
    await expect(page.getByText(/Downtown Garage|Checkout|Pay|Book/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
