import { getBffUrl } from "@/lib/auth/client";

/** Fetch a Go API JWT from the Better Auth cookie session. */
export async function fetchGoBridgeToken(): Promise<string | null> {
  const res = await fetch(`${getBffUrl()}/api/session/go-token`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    success?: boolean;
    data?: { token?: string };
  };
  if (!json.success || !json.data?.token) return null;
  return json.data.token;
}
