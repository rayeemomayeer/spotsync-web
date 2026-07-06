const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api/v1";

export function getApiBaseUrl(): string {
  return API_BASE;
}

export async function probeApiHealth(): Promise<boolean> {
  try {
    const origin = API_BASE.replace(/\/api\/v1\/?$/, "");
    const res = await fetch(`${origin}/healthz`, { signal: AbortSignal.timeout(4000) });
    return res.ok;
  } catch {
    return false;
  }
}
