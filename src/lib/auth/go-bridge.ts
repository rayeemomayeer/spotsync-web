import { getBffUrl } from "@/lib/auth/client";

type BridgeCreds = { email: string; password: string };

/** Fetch a Go API JWT — POST with password when cookies flaky; GET for cookie session. */
export async function fetchGoBridgeToken(creds?: BridgeCreds): Promise<string | null> {
  if (creds?.email && creds.password) {
    const res = await fetch(`${getBffUrl()}/api/session/go-token`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: creds.email.trim(),
        password: creds.password,
      }),
    });
    if (res.ok) {
      const json = (await res.json()) as {
        success?: boolean;
        data?: { token?: string };
      };
      if (json.success && json.data?.token) return json.data.token;
    }
  }

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
