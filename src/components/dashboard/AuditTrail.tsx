"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { AuditLog } from "@/lib/api/types";

export function AuditTrail({
  token,
  organizationId,
}: {
  token: string | null;
  organizationId?: number;
}) {
  const auditQuery = useQuery({
    queryKey: ["org-audit", organizationId ?? "all"],
    queryFn: () => api.orgAudit(token, organizationId),
  });

  const rows: AuditLog[] = auditQuery.data ?? [];

  return (
    <div className="dash-panel">
      <div className="dash-chart__head">
        <h2>Audit trail</h2>
        <p>Org mutations · approve, members, plan changes</p>
      </div>
      <ul className="dash-table">
        {auditQuery.isLoading ? <li className="dash-table__row">Loading…</li> : null}
        {auditQuery.isError ? (
          <li className="dash-table__row dash-table__row--empty">Failed to load audit log.</li>
        ) : null}
        {!auditQuery.isLoading && rows.length === 0 ? (
          <li className="dash-table__row dash-table__row--empty">No audit events yet.</li>
        ) : null}
        {rows.map((a) => (
          <li key={a.id} className="dash-table__row">
            <div>
              <strong className="font-mono">{a.action}</strong>
              <p className="dash-table__meta">
                {a.resource_type}
                {a.resource_id != null ? ` #${a.resource_id}` : ""}
                {a.organization_id != null ? ` · org #${a.organization_id}` : ""}
                {a.actor_user_id != null ? ` · actor #${a.actor_user_id}` : ""}
              </p>
            </div>
            <span className="dash-table__meta font-mono">
              {new Date(a.created_at).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
