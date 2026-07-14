"use client";

import { useCallback, useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Badge } from "@/components/ui/Badge";
import { AdminShell, PLATFORM_NAV } from "@/components/dashboard/AdminShell";
import { useAuth } from "@/components/providers/AuthProvider";
import { getBffUrl } from "@/lib/auth/client";

type PlatformUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  go_user_id: number | null;
  email_verified: boolean;
  created_at: string | null;
};

export default function PlatformUsersPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<PlatformUser[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${getBffUrl()}/api/platform/users`, {
        credentials: "include",
        cache: "no-store",
      });
      const json = (await res.json()) as {
        success?: boolean;
        message?: string;
        data?: PlatformUser[];
      };
      if (!res.ok || !json.success) {
        throw new Error(json.message ?? `Failed (${res.status})`);
      }
      setRows(json.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
      setRows([]);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="shell">
      <AppHeader tag="Users" />
      <main className="shell-main shell-main--wide">
        <AdminShell
          eyebrow="Platform"
          title="Users"
          subtitle="Better Auth accounts (BFF) with Go bridge ids — saas_admin only."
          nav={PLATFORM_NAV}
        >
          {!user ? <p>Sign in as platform admin.</p> : null}
          {error ? <p className="auth-card__error">{error}</p> : null}
          {busy && rows.length === 0 ? <p>Loading users…</p> : null}
          {!busy && !error && rows.length === 0 ? (
            <p className="dash-empty">No users returned from BFF.</p>
          ) : null}
          <ul className="dash-table">
            {rows.map((r) => (
              <li key={r.id} className="dash-table__row">
                <div>
                  <strong>{r.name || r.email}</strong>
                  <p className="dash-table__meta">
                    {r.email}
                    {r.created_at ? ` · ${new Date(r.created_at).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <div className="dash-table__actions">
                  <Badge tone="muted">{r.role}</Badge>
                  <Badge tone={r.email_verified ? "success" : "muted"}>
                    {r.email_verified ? "verified" : "unverified"}
                  </Badge>
                  <span className="font-mono dash-table__meta">
                    go:{r.go_user_id ?? "—"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <p>
            <button type="button" className="console-btn console-btn--ghost" onClick={() => void load()}>
              Refresh
            </button>
          </p>
        </AdminShell>
      </main>
    </div>
  );
}
