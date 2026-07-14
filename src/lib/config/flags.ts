const KNOWN_FLAGS = [
  "stripe_billing",
  "driver_payments",
  "org_search",
  "demo_console",
  "demo_mode",
  "google_oauth",
] as const;

export type FeatureFlag = (typeof KNOWN_FLAGS)[number];

function parseFlags(): Set<string> {
  const raw = process.env.NEXT_PUBLIC_FEATURE_FLAGS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return parseFlags().has(flag);
}

export function listEnabledFeatures(): FeatureFlag[] {
  const enabled = parseFlags();
  return KNOWN_FLAGS.filter((f) => enabled.has(f));
}

/** Hosted Stripe Checkout (not Elements) is the production path when payments flags are on. */
export function usesHostedCheckout(): boolean {
  return isFeatureEnabled("driver_payments") || isFeatureEnabled("stripe_billing");
}
