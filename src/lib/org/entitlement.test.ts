import { describe, expect, it } from "vitest";
import { isEntitlementApiError, orgEntitlement } from "./entitlement";
import type { Organization } from "@/lib/api/types";

function org(partial: Partial<Organization>): Organization {
  return {
    id: 1,
    name: "Test Org",
    slug: "test-org",
    status: "active",
    billing_plan: "starter",
    created_at: "",
    updated_at: "",
    ...partial,
  };
}

describe("orgEntitlement", () => {
  it("blocks missing org", () => {
    expect(orgEntitlement(null).entitled).toBe(false);
    expect(orgEntitlement(null).reason).toBe("no-org");
  });

  it("blocks pending without requiring plan first", () => {
    const s = orgEntitlement(org({ status: "pending", billing_plan: null }));
    expect(s.entitled).toBe(false);
    expect(s.reason).toBe("pending");
  });

  it("blocks active org without plan", () => {
    const s = orgEntitlement(org({ billing_plan: null }));
    expect(s.entitled).toBe(false);
    expect(s.reason).toBe("no-plan");
    expect(s.ctaHref).toBe("/org/billing");
  });

  it("allows active starter/growth", () => {
    expect(orgEntitlement(org({ billing_plan: "starter" })).entitled).toBe(true);
    expect(orgEntitlement(org({ billing_plan: "growth" })).entitled).toBe(true);
  });
});

describe("isEntitlementApiError", () => {
  it("detects Go envelope", () => {
    expect(
      isEntitlementApiError("Organization not entitled", {
        organization: "Active subscription required",
      }),
    ).toBe(true);
  });
});
