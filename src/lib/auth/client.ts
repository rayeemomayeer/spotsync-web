import { createAuthClient } from "better-auth/react";

const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL ?? "http://localhost:4000";

export const authClient = createAuthClient({
  baseURL: BFF_URL,
});

export function getBffUrl(): string {
  return BFF_URL;
}
