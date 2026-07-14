import type { Organization } from "@/lib/api/types";

export type EntitlementBlockReason =
  | "no-org"
  | "pending"
  | "suspended"
  | "rejected"
  | "no-plan"
  | "invalid-plan";

export type EntitlementState = {
  entitled: boolean;
  reason: EntitlementBlockReason | null;
  title: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
};

const PLANS = new Set(["starter", "growth"]);

/**
 * Mirrors Go EnsureOrgEntitled: active + billing_plan in {starter, growth}.
 */
export function orgEntitlement(org: Organization | null | undefined): EntitlementState {
  if (!org) {
    return {
      entitled: false,
      reason: "no-org",
      title: "No organization linked",
      body: "Sign in as an organization and submit a garage application. After approval and a paid plan, zone publish unlocks.",
      ctaHref: "/apply",
      ctaLabel: "Apply for organization",
    };
  }

  const status = (org.status ?? "").toLowerCase();
  if (status === "pending") {
    return {
      entitled: false,
      reason: "pending",
      title: "Waiting for platform approval",
      body: "Your organization account is ready. A SaaS admin must approve before you can subscribe and create zones/spots.",
      ctaHref: "/org",
      ctaLabel: "Check status",
    };
  }
  if (status === "suspended") {
    return {
      entitled: false,
      reason: "suspended",
      title: "Organization suspended",
      body: "Inventory changes are blocked while the org is suspended. Contact a platform admin.",
    };
  }
  if (status === "rejected") {
    return {
      entitled: false,
      reason: "rejected",
      title: "Organization rejected",
      body: "This org was not approved for the marketplace. Create a new application or contact support.",
    };
  }
  if (status !== "active") {
    return {
      entitled: false,
      reason: "pending",
      title: "Organization not active",
      body: `Status “${org.status}” cannot publish zones. Approval + an active plan are required.`,
      ctaHref: "/org/billing",
      ctaLabel: "Billing",
    };
  }

  const plan = (org.billing_plan ?? "").trim().toLowerCase();
  if (!plan) {
    return {
      entitled: false,
      reason: "no-plan",
      title: "Subscription required",
      body: "Pick Starter or Growth (Stripe test mode) before creating zones. Capacity stays locked until checkout completes.",
      ctaHref: "/org/billing",
      ctaLabel: "Choose a plan",
    };
  }
  if (!PLANS.has(plan)) {
    return {
      entitled: false,
      reason: "invalid-plan",
      title: "Plan not recognized",
      body: `Billing plan “${plan}” is not entitled for zone CRUD. Upgrade to Starter or Growth.`,
      ctaHref: "/org/billing",
      ctaLabel: "Fix plan",
    };
  }

  return {
    entitled: true,
    reason: null,
    title: "",
    body: "",
  };
}

export function isEntitlementApiError(message: string, errors?: Record<string, string>): boolean {
  const orgField = errors?.organization?.toLowerCase() ?? "";
  const msg = message.toLowerCase();
  return (
    msg.includes("not entitled") ||
    orgField.includes("subscription") ||
    orgField.includes("entitled")
  );
}
