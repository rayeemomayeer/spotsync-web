import { createAuthClient } from "better-auth/react";

/** Prefer same-origin (Vercel rewrites → BFF). Fall back to explicit BFF URL for local. */
function resolveBffUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BFF_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:4000";
}

const BFF_URL = resolveBffUrl();

export const authClient = createAuthClient({
  baseURL: BFF_URL,
  fetchOptions: {
    credentials: "include",
  },
});

export function getBffUrl(): string {
  return BFF_URL;
}
