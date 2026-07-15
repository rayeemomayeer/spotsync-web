"use client";

import { useEffect } from "react";
import { startBackendWarm, warmBackend } from "@/lib/api/warm-backend";

/** How often to re-ping while a tab stays open (Render free sleeps ~15m idle). */
const KEEP_WARM_MS = 10 * 60 * 1000;

/**
 * Fire-and-forget Render cold-start wake on first paint, then soft keep-alive
 * while this tab is open / visible — free alternative to paid always-on hosts.
 */
export function SoftWarm() {
  useEffect(() => {
    startBackendWarm();

    const tick = () => {
      void warmBackend().catch(() => undefined);
    };

    const id = window.setInterval(tick, KEEP_WARM_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
