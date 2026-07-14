"use client";

import { useEffect, useState } from "react";
import { startBackendWarm, warmBackend, type WarmProgress } from "@/lib/api/warm-backend";
import { toAuthUserMessage } from "@/lib/api/fetch-retry";

type Phase = WarmProgress | "signing";

/**
 * Pre-warms BFF + Go on mount; exposes ensureReady() for submit path.
 */
export function useAuthColdStart() {
  const [phase, setPhase] = useState<Phase>("warming");

  useEffect(() => {
    let cancelled = false;
    startBackendWarm();
    void (async () => {
      try {
        const r = await warmBackend();
        if (cancelled) return;
        setPhase(r.bff ? "ready" : "degraded");
      } catch {
        if (!cancelled) setPhase("degraded");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function ensureReady(): Promise<void> {
    if (phase === "ready") return;
    setPhase("warming");
    try {
      const r = await warmBackend();
      setPhase(r.bff ? "ready" : "degraded");
    } catch {
      setPhase("degraded");
    }
  }

  function mapError(err: unknown): string {
    return toAuthUserMessage(err);
  }

  return { phase, setPhase, ensureReady, mapError };
}

export function AuthColdStartStatus({ phase }: { phase: Phase }) {
  if (phase === "idle" || phase === "ready") return null;

  const copy =
    phase === "warming"
      ? "Waking free-tier API… first open after sleep can take 30–90s. Leave this open."
      : phase === "signing"
        ? "Signing in… still waiting on API if it just woke."
        : "API still slow or asleep. Submit will keep retrying — leave this tab open.";

  return <p className="auth-card__wake">{copy}</p>;
}
