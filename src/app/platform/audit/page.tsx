"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/AppHeader";
import { PlatformShell } from "@/components/platform/PlatformShell";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api/client";

export default function PlatformAuditPage() {
  const { token } = useAuth();
  const auditQuery = useQuery({
    queryKey: ["platform-audit"],
    queryFn: () => api.orgAudit(token),
    enabled: !!token,
  });

  const logs = auditQuery.data ?? [];

  return (
    <div className="shell">
      <AppHeader tag="Audit" />
      <main className="shell-main">
        <div className="shell-card">
          <PlatformShell title="Audit log">
            {auditQuery.isLoading ? <p>Loading audit…</p> : null}
            {auditQuery.isError ? <p className="auth-card__error">Failed to load audit log.</p> : null}
            <ul className="console-zone-list">
              {logs.length === 0 && !auditQuery.isLoading ? (
                <li className="shell-card" style={{ boxShadow: "none" }}>
                  <p style={{ margin: 0 }}>No audit entries.</p>
                </li>
              ) : (
                logs.map((e) => (
                  <li key={e.id} className="shell-card" style={{ boxShadow: "none" }}>
                    <strong>{e.action}</strong>
                    <p style={{ margin: "0.35rem 0", fontSize: "0.85rem" }}>
                      {e.resource_type}
                      {e.resource_id != null ? ` #${e.resource_id}` : ""}
                      {e.organization_id != null ? ` · org #${e.organization_id}` : ""}
                      {e.actor_user_id != null ? ` · actor #${e.actor_user_id}` : ""}
                    </p>
                    <time dateTime={e.created_at}>{new Date(e.created_at).toLocaleString()}</time>
                  </li>
                ))
              )}
            </ul>
            <p>
              <Link href="/platform">← Overview</Link>
            </p>
          </PlatformShell>
        </div>
      </main>
    </div>
  );
}
