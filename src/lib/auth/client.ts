import { createAuthClient } from "better-auth/react";
import { fetchWithColdStartRetry } from "@/lib/api/fetch-retry";

const BFF_URL = (process.env.NEXT_PUBLIC_BFF_URL ?? "http://localhost:4000").replace(/\/$/, "");

export const authClient = createAuthClient({
  baseURL: BFF_URL,
  fetchOptions: {
    credentials: "include",
    customFetchImpl: (url, init) =>
      fetchWithColdStartRetry(url, init, { attempts: 4, timeoutMs: 90_000 }),
  },
});

export function getBffUrl(): string {
  return BFF_URL;
}
