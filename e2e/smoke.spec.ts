import { test, expect } from "@playwright/test";

test.describe("Marketing + theme", () => {
  test("landing shows SpotSync brand and CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "SpotSync" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Get started/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Sign in$/i })).toBeVisible();
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

test.describe("Auth + role shells", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("signup page renders", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("console hides demo buttons when demo mode off", async ({ page }) => {
    test.skip(process.env.NEXT_PUBLIC_DEMO_MODE === "true", "Demo mode enabled in this env");
    await page.goto("/console");
    await expect(page.getByText("Live Console")).toBeVisible();
    await expect(page.getByRole("button", { name: "Demo Driver" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Demo Admin" })).toHaveCount(0);
  });

  test("driver shell loads map-first experience", async ({ page }) => {
    await page.goto("/driver");
    await expect(page.getByTestId("driver-map")).toBeVisible();
    await expect(page.getByPlaceholder("Where to park?")).toBeVisible();
  });

  test("org shell redirects anonymous to login", async ({ page }) => {
    await page.goto("/org");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("platform shell redirects anonymous to login", async ({ page }) => {
    await page.goto("/platform");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("billing page shows Stripe test surface", async ({ page }) => {
    await page.goto("/platform/billing");
    await expect(page.getByRole("heading", { name: /Billing/i })).toBeVisible();
    await expect(page.getByText(/Stripe/i).first()).toBeVisible();
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
    test.skip(process.env.NEXT_PUBLIC_DEMO_MODE !== "true", "Needs NEXT_PUBLIC_DEMO_MODE=true");

    await page.goto("/console");
    await page.getByRole("button", { name: "Demo Driver" }).click();
    await expect(page.getByRole("heading", { name: "Reserve" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Demo reserve|Reserve spot/ })).toBeVisible();
  });
});
