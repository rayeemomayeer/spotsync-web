"use client";

import { useEffect, useState } from "react";
import { getApiBaseUrl, probeApiHealth } from "@/lib/config/validate-env";

export function ApiEnvBanner() {
  const [warn, setWarn] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    let cancelled = false;
    void (async () => {
      const ok = await probeApiHealth();
      if (!cancelled && !ok) setWarn(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!warn) return null;

  return (
    <p className="console-banner console-banner--warn">
      Cannot reach API at <code>{getApiBaseUrl()}</code> — start SpotSync backend or fix{" "}
      <code>NEXT_PUBLIC_API_BASE_URL</code>
    </p>
  );
}
