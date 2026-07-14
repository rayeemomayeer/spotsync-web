import { createAuthClient } from "better-auth/react";
import { fetchWithColdStartRetry } from "@/lib/api/fetch-retry";

/**
 * Always target the BFF origin — never same-origin `/api/auth` rewrites.
 * Vercel→Render rewrites return 504 while free tiers wake; direct calls wait.
 * Cookies use SameSite=None + Secure + Partitioned in production (BFF auth.ts).
 */
export function getBffUrl(): string {
  return (process.env.NEXT_PUBLIC_BFF_URL ?? "http://localhost:4000").replace(/\/$/, "");
}

export function resolveAuthBaseURL(): string {
  return getBffUrl();
}

export const authClient = createAuthClient({
  baseURL: resolveAuthBaseURL(),
  fetchOptions: {
    credentials: "include",
    customFetchImpl: (url, init) =>
      fetchWithColdStartRetry(url, init, { attempts: 5, timeoutMs: 90_000 }),
  },
});
