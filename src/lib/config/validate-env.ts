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
    const origin = API_BASE.replace(/\/api\/v1\/?$/, "");
    const res = await fetch(`${origin}/healthz`, { signal: AbortSignal.timeout(4000) });
    return res.ok;
  } catch {
    return false;
  }
}
