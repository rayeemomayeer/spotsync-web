const KNOWN_FLAGS = ["stripe_billing", "org_search", "demo_console"] as const;

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
