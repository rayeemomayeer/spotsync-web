"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/components/providers/AuthProvider";
import { api, ApiError } from "@/lib/api/client";
import type { Organization } from "@/lib/api/types";
import { isPlatformAdmin } from "@/lib/auth/roles";

export default function PlatformPage() {
  const { user, token, loading } = useAuth();
  const allowed = user && isPlatformAdmin(user.role);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const load = useCallback(async () => {
    if (!allowed) return;
    setBusy(true);
    setError("");
    try {
      const list = await api.orgs(token, q.trim() || undefined);
      setOrgs(list);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load orgs");
    } finally {
      setBusy(false);
    }
  }, [allowed, token, q]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.createOrg(token, { name: name.trim(), slug: slug.trim() });
      setName("");
      setSlug("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggleStatus(org: Organization) {
    if (org.status === "pending" || org.status === "rejected") return;
    const next = org.status === "active" ? "suspended" : "active";
    setBusy(true);
    setError("");
    try {
      await api.setOrgStatus(token, org.id, next);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Status update failed");
    } finally {
      setBusy(false);
    }
  }

  async function approveOrg(org: Organization) {
    setBusy(true);
    setError("");
    try {
      await api.approveOrg(token, org.id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Approve failed");
    } finally {
      setBusy(false);
    }
  }

  async function rejectOrg(org: Organization) {
    setBusy(true);
    setError("");
    try {
      await api.rejectOrg(token, org.id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Reject failed");
    } finally {
      setBusy(false);
    }
  }

  const pendingOrgs = orgs.filter((o) => o.status === "pending");
  const otherOrgs = orgs.filter((o) => o.status !== "pending");

  return (
    <div className="shell">
      <AppHeader tag="Platform" showAuthCta={!user} />
      <main className="shell-main">
        <div className="shell-card">
          <h1>Platform admin</h1>
          {loading ? (
            <p>Loading session…</p>
          ) : !user ? (
            <p>
              Sign in as saas_admin (legacy admin accepted). <Link href="/login">Sign in</Link>
            </p>
          ) : !allowed ? (
            <p>Role gate: saas_admin / admin only. Your role: {user.role}</p>
          ) : (
            <>
              <p>Marketplace orgs via BFF → Go. Approve pending, manage status, billing.</p>
              {error ? <p className="auth-card__error">{error}</p> : null}

              {pendingOrgs.length > 0 ? (
                <>
                  <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Pending approval</h2>
                  <ul className="console-zone-list" style={{ marginBottom: "1.25rem" }}>
                    {pendingOrgs.map((org) => (
                      <li key={org.id} className="shell-card" style={{ boxShadow: "none" }}>
                        <strong>
                          {org.name}{" "}
                          <span style={{ fontWeight: 400, opacity: 0.7 }}>({org.slug})</span>
                        </strong>
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                          <button
                            type="button"
                            className="console-btn console-btn--primary"
                            disabled={busy}
                            onClick={() => void approveOrg(org)}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="console-btn console-btn--ghost"
                            disabled={busy}
                            onClick={() => void rejectOrg(org)}
                          >
                            Reject
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                <input
                  type="search"
                  placeholder="Search orgs"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  style={{ flex: "1 1 12rem" }}
                />
                <button type="button" className="console-btn console-btn--ghost" disabled={busy} onClick={() => void load()}>
                  Refresh
                </button>
              </div>

              <ul className="console-zone-list" style={{ marginBottom: "1.25rem" }}>
                {otherOrgs.length === 0 && !busy ? (
                  <li className="shell-card" style={{ boxShadow: "none" }}>
                    <p style={{ margin: 0 }}>No organizations yet.</p>
                  </li>
                ) : (
                  otherOrgs.map((org) => (
                    <li key={org.id} className="shell-card" style={{ boxShadow: "none" }}>
                      <strong>
                        {org.name}{" "}
                        <span style={{ fontWeight: 400, opacity: 0.7 }}>({org.slug})</span>
                      </strong>
                      <p style={{ margin: "0.35rem 0" }}>
                        Status: <code>{org.status}</code>
                        {org.billing_plan ? (
                          <>
                            {" "}
                            · Plan: <code>{org.billing_plan}</code>
                          </>
                        ) : null}
                      </p>
                      <button
                        type="button"
                        className="console-btn console-btn--ghost"
                        disabled={busy || org.status === "pending" || org.status === "rejected"}
                        onClick={() => void toggleStatus(org)}
                      >
                        {org.status === "active" ? "Suspend" : "Activate"}
                      </button>
                    </li>
                  ))
                )}
              </ul>

              <form onSubmit={onCreate} style={{ display: "grid", gap: "0.5rem", marginBottom: "1.25rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Create org</h2>
                <input
                  required
                  minLength={2}
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  required
                  minLength={2}
                  placeholder="slug-kebab"
                  pattern="[a-z0-9-]+"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
                <button type="submit" className="console-btn console-btn--primary" disabled={busy}>
                  Create
                </button>
              </form>

              <p>
                <Link href="/platform/billing">Billing (Stripe test) →</Link> ·{" "}
                <Link href="/pricing">Public pricing →</Link>
              </p>
              <Link href="/console">Open live console →</Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
