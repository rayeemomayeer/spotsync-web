"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { api, ApiError } from "@/lib/api/client";

export function MembersManager({
  orgId,
  token,
}: {
  orgId: number;
  token: string | null;
}) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const membersQuery = useQuery({
    queryKey: ["org-members", orgId],
    queryFn: () => api.orgMembers(token, orgId),
    enabled: orgId > 0,
  });

  const assign = useMutation({
    mutationFn: () => api.assignOrgMember(token, orgId, email.trim()),
    onSuccess: async () => {
      setEmail("");
      setError("");
      await qc.invalidateQueries({ queryKey: ["org-members", orgId] });
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : "Assign failed"),
  });

  const remove = useMutation({
    mutationFn: (userId: number) => api.removeOrgMember(token, orgId, userId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["org-members", orgId] });
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : "Remove failed"),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    assign.mutate();
  }

  const members = membersQuery.data ?? [];

  return (
    <div className="dash-panel">
      <div className="dash-chart__head">
        <h2>Team members</h2>
        <p>Invite by email — user must already exist on SpotSync.</p>
      </div>

      <form className="dash-inline-form" onSubmit={onSubmit}>
        <Input
          type="email"
          placeholder="driver@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-label="Member email"
        />
        <button
          type="submit"
          className="console-btn console-btn--primary console-btn--pill"
          disabled={assign.isPending}
        >
          {assign.isPending ? "Adding…" : "Add member"}
        </button>
      </form>
      {error ? <p className="auth-card__error">{error}</p> : null}

      <ul className="dash-table">
        {membersQuery.isLoading ? <li className="dash-table__row">Loading…</li> : null}
        {!membersQuery.isLoading && members.length === 0 ? (
          <li className="dash-table__row dash-table__row--empty">No members linked yet.</li>
        ) : null}
        {members.map((m) => (
          <li key={m.user_id} className="dash-table__row">
            <div>
              <strong>{m.name}</strong>
              <p className="dash-table__meta">{m.email}</p>
            </div>
            <Badge tone="muted">{m.role}</Badge>
            <button
              type="button"
              className="console-btn console-btn--ghost"
              disabled={remove.isPending}
              onClick={() => remove.mutate(m.user_id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
