"use client";

import { useEffect } from "react";
import { initClientObservability } from "@/lib/observability/client";

/** Boots optional client observability (Sentry stub when DSN set). */
export function ObservabilityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initClientObservability();
  }, []);
  return children;
}
