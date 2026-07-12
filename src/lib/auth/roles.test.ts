import { describe, expect, it } from "vitest";
import { homePathForRole, isPlatformAdmin, normalizeRole } from "./roles";

describe("normalizeRole", () => {
  it("maps legacy admin to saas_admin", () => {
    expect(normalizeRole("admin")).toBe("saas_admin");
  });

  it("keeps marketplace roles", () => {
    expect(normalizeRole("saas_admin")).toBe("saas_admin");
    expect(normalizeRole("org_admin")).toBe("org_admin");
    expect(normalizeRole("driver")).toBe("driver");
  });
});

describe("homePathForRole", () => {
  it("routes by role", () => {
    expect(homePathForRole("admin")).toBe("/platform");
    expect(homePathForRole("saas_admin")).toBe("/platform");
    expect(homePathForRole("org_admin")).toBe("/org");
    expect(homePathForRole("driver")).toBe("/driver");
  });
});

describe("isPlatformAdmin", () => {
  it("accepts legacy admin", () => {
    expect(isPlatformAdmin("admin")).toBe(true);
    expect(isPlatformAdmin("driver")).toBe(false);
  });
});
