const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api/v1";
const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL ?? "http://localhost:4000";

export function getApiBaseUrl(): string {
  return API_BASE;
}

export function getBffUrl(): string {
  return BFF_URL;
}

export async function probeApiHealth(): Promise<boolean> {
  try {
    // Prefer same-origin /healthz (Vercel rewrite → BFF), then API origin.
    const candidates = [
      "/healthz",
      `${API_BASE.replace(/\/api\/v1\/?$/, "")}/healthz`,
      `${BFF_URL.replace(/\/$/, "")}/healthz`,
    ];
    for (const url of candidates) {
      try {
        const res = await fetch(url, {
          signal: AbortSignal.timeout(8000),
          credentials: "include",
        });
        if (res.ok) return true;
      } catch {
        /* try next */
      }
    }
    return false;
  } catch {
    return false;
  }
}
