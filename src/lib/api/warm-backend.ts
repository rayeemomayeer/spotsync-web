import { fetchWithColdStartRetry } from "./fetch-retry";

function bffOrigin(): string {
  return (process.env.NEXT_PUBLIC_BFF_URL ?? "http://localhost:4000").replace(/\/$/, "");
}

function goOrigin(): string {
  const api = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api/v1";
  return api.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
}

export type WarmProgress = "idle" | "warming" | "ready" | "degraded";

/**
 * Hit BFF + Go healthz directly (not via Vercel rewrite) so free-tier
 * instances start waking before the user submits credentials.
 */
export async function warmBackend(): Promise<{ bff: boolean; go: boolean }> {
  const init: RequestInit = {
    method: "GET",
    credentials: "omit",
    cache: "no-store",
  };
  const probeOpts = { attempts: 6, timeoutMs: 45_000 };

  const [bffRes, goRes] = await Promise.allSettled([
    fetchWithColdStartRetry(`${bffOrigin()}/healthz`, init, probeOpts),
    fetchWithColdStartRetry(`${goOrigin()}/healthz`, init, probeOpts),
  ]);

  const bff = bffRes.status === "fulfilled" && bffRes.value.ok;
  const go = goRes.status === "fulfilled" && goRes.value.ok;
  return { bff, go };
}

/** Fire-and-forget warm used on auth page mount. */
export function startBackendWarm(): void {
  if (typeof window === "undefined") return;
  void warmBackend().catch(() => {
    /* submit path warms again */
  });
}
