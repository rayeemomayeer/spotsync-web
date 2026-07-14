"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/components/providers/AuthProvider";
import { api, ApiError } from "@/lib/api/client";
import type { Zone } from "@/lib/api/types";
import { isOrgAdmin, isPlatformAdmin } from "@/lib/auth/roles";

export default function OrgPage() {
  const { user, loading } = useAuth();
  const allowed = user && (isOrgAdmin(user.role) || isPlatformAdmin(user.role));
  const [zones, setZones] = useState<Zone[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!allowed) return;
    setBusy(true);
    setError("");
    try {
      const list = await api.zones();
      setZones(list);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load zones");
    } finally {
      setBusy(false);
    }
  }, [allowed]);

  useEffect(() => {
    void load();
  }, [load]);

  const orgZones = useMemo(() => {
    if (isPlatformAdmin(user?.role)) return zones;
    const tagged = zones.filter((z) => z.organization_id != null);
    return tagged.length > 0 ? tagged : zones;
  }, [zones, user?.role]);

  return (
    <div className="shell">
      <AppHeader tag="Org" showAuthCta={!user} />
      <main className="shell-main page-surface">
        <h1>Org operations</h1>
        {loading ? (
          <p>Loading session…</p>
        ) : !user ? (
          <p>
            Sign in as an org admin. <Link href="/login">Sign in</Link>
          </p>
        ) : !allowed ? (
          <p>Role gate: need org_admin (or platform admin). Your role: {user.role}</p>
        ) : (
          <>
            <p>Zones for your org. Dense ops continue in the live console.</p>
            {error ? <p className="auth-card__error">{error}</p> : null}
            <p>
              <button
                type="button"
                className="console-btn console-btn--ghost"
                disabled={busy}
                onClick={() => void load()}
              >
                {busy ? "Loading…" : "Refresh"}
              </button>
            </p>
            <ul className="receipt-list">
              {orgZones.length === 0 ? (
                <li className="receipt-card receipt-card--empty">
                  <p>No zones yet. Create one from admin tools or seed data.</p>
                </li>
              ) : (
                orgZones.map((z) => (
                  <li key={z.id} className="receipt-card">
                    <div className="receipt-card__head">
                      <strong>{z.name}</strong>
                      <Badge tone={z.available_spots > 0 ? "success" : "muted"}>
                        {z.available_spots}/{z.total_capacity}
                      </Badge>
                    </div>
                    <p className="receipt-card__meta">
                      {z.type}
                      {z.organization_id != null ? ` · org #${z.organization_id}` : ""}
                    </p>
                    <Link href={`/console?zone=${z.id}`}>Open in console →</Link>
                  </li>
                ))
              )}
            </ul>
            <p>
              <Link href="/org/billing">Billing →</Link> · <Link href="/console">Open live console →</Link>
            </p>
          </>
        )}
      </main>
    </div>
  );
}
