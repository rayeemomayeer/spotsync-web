import { createAuthClient } from "better-auth/react";
import { fetchWithColdStartRetry } from "@/lib/api/fetch-retry";

function resolveAuthBaseURL(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return (process.env.NEXT_PUBLIC_BFF_URL ?? "http://localhost:4000").replace(/\/$/, "");
}

export const authClient = createAuthClient({
  baseURL: resolveAuthBaseURL(),
  fetchOptions: {
    credentials: "include",
    customFetchImpl: (url, init) =>
      fetchWithColdStartRetry(url, init, { attempts: 4, timeoutMs: 90_000 }),
  },
});

export function getBffUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return (process.env.NEXT_PUBLIC_BFF_URL ?? "http://localhost:4000").replace(/\/$/, "");
}
