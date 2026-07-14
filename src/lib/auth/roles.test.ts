import { describe, expect, it } from "vitest";
import {
  canAccessPath,
  homePathForRole,
  isPlatformAdmin,
  normalizeRole,
  postAuthPath,
  primaryNavLinks,
} from "./roles";

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

describe("postAuthPath", () => {
  it("honors next override", () => {
    expect(postAuthPath("driver", { next: "/apply" })).toBe("/apply");
  });

  it("routes organization intent", () => {
    expect(postAuthPath("org_admin", { intent: "organization" })).toBe("/org");
    expect(postAuthPath("driver", { intent: "organization" })).toBe("/apply");
    expect(postAuthPath("saas_admin", { intent: "organization" })).toBe("/platform");
  });
});

describe("isPlatformAdmin", () => {
  it("accepts legacy admin", () => {
    expect(isPlatformAdmin("admin")).toBe(true);
    expect(isPlatformAdmin("driver")).toBe(false);
  });
});

describe("canAccessPath", () => {
  it("allows public paths", () => {
    expect(canAccessPath(null, "/")).toBe(true);
    expect(canAccessPath(null, "/search")).toBe(true);
  });

  it("gates platform to saas_admin", () => {
    expect(canAccessPath("saas_admin", "/platform/orgs")).toBe(true);
    expect(canAccessPath("org_admin", "/platform")).toBe(false);
    expect(canAccessPath("driver", "/platform")).toBe(false);
  });

  it("gates org to org/platform admin", () => {
    expect(canAccessPath("org_admin", "/org/billing")).toBe(true);
    expect(canAccessPath("saas_admin", "/org")).toBe(true);
    expect(canAccessPath("driver", "/org")).toBe(false);
  });

  it("gates console away from org_admin", () => {
    expect(canAccessPath("org_admin", "/console")).toBe(false);
    expect(canAccessPath("driver", "/console")).toBe(true);
    expect(canAccessPath("saas_admin", "/console")).toBe(true);
  });

  it("requires auth for driver surfaces", () => {
    expect(canAccessPath(null, "/driver")).toBe(false);
    expect(canAccessPath("driver", "/reservations")).toBe(true);
  });
});

describe("primaryNavLinks", () => {
  it("shows role homes for signed-in users", () => {
    expect(primaryNavLinks("saas_admin").some((l) => l.href === "/platform")).toBe(true);
    expect(primaryNavLinks("saas_admin").some((l) => l.href === "/platform/users")).toBe(true);
    expect(primaryNavLinks("saas_admin").every((l) => l.href !== "/platform/grafana")).toBe(true);
    expect(primaryNavLinks("org_admin").some((l) => l.href === "/org")).toBe(true);
    expect(primaryNavLinks("org_admin").some((l) => l.href === "/org/members")).toBe(true);
    expect(primaryNavLinks("driver").some((l) => l.href === "/driver")).toBe(true);
    expect(primaryNavLinks("driver").some((l) => l.href === "/apply")).toBe(true);
    expect(primaryNavLinks(null).some((l) => l.href === "/login?as=org")).toBe(true);
  });
});
