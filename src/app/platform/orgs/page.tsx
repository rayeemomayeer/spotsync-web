"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { PlatformShell } from "@/components/platform/PlatformShell";
import { useAuth } from "@/components/providers/AuthProvider";
import { api, ApiError } from "@/lib/api/client";
import type { Organization } from "@/lib/api/types";

export default function PlatformOrgsPage() {
  const { token } = useAuth();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      setOrgs(await api.orgs(token, q.trim() || undefined));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load orgs");
    } finally {
      setBusy(false);
    }
  }, [token, q]);

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

  async function approveOrg(org: Organization) {
    setBusy(true);
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
    try {
      await api.rejectOrg(token, org.id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Reject failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggleStatus(org: Organization) {
    if (org.status === "pending" || org.status === "rejected") return;
    const next = org.status === "active" ? "suspended" : "active";
    setBusy(true);
    try {
      await api.setOrgStatus(token, org.id, next);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Status update failed");
    } finally {
      setBusy(false);
    }
  }

  const pendingOrgs = orgs.filter((o) => o.status === "pending");
  const otherOrgs = orgs.filter((o) => o.status !== "pending");

  return (
    <div className="shell">
      <AppHeader tag="Orgs" />
      <main className="shell-main page-surface">
        <PlatformShell title="Organizations">
          {error ? <p className="auth-card__error">{error}</p> : null}

          {pendingOrgs.length > 0 ? (
            <>
              <h2 className="page-surface__sub">Pending approval</h2>
              <ul className="receipt-list">
                {pendingOrgs.map((org) => (
                  <li key={org.id} className="receipt-card">
                    <div className="receipt-card__head">
                      <strong>
                        {org.name} <span className="receipt-card__status">({org.slug})</span>
                      </strong>
                      <Badge tone="warn">pending</Badge>
                    </div>
                    <div className="zone-card__actions">
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

          <div className="search-toolbar">
            <Input
              type="search"
              placeholder="Search orgs"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search organizations"
            />
            <button
              type="button"
              className="console-btn console-btn--ghost"
              disabled={busy}
              onClick={() => void load()}
            >
              Refresh
            </button>
          </div>

          <ul className="receipt-list">
            {otherOrgs.map((org) => (
              <li key={org.id} className="receipt-card">
                <div className="receipt-card__head">
                  <strong>
                    {org.name} <span className="receipt-card__status">({org.slug})</span>
                  </strong>
                  <Badge tone={org.status === "active" ? "success" : "muted"}>{org.status}</Badge>
                </div>
                <p className="receipt-card__meta">
                  {org.billing_plan ? <>plan {org.billing_plan}</> : "no plan"}
                </p>
                <button
                  type="button"
                  className="console-btn console-btn--ghost"
                  disabled={busy || org.status === "rejected"}
                  onClick={() => void toggleStatus(org)}
                >
                  {org.status === "active" ? "Suspend" : "Activate"}
                </button>
              </li>
            ))}
          </ul>

          <form onSubmit={onCreate} className="account-section">
            <h2 className="page-surface__sub">Create org</h2>
            <label>
              Name
              <Input required minLength={2} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
              Slug
              <Input
                required
                minLength={2}
                placeholder="slug-kebab"
                pattern="[a-z0-9-]+"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </label>
            <button type="submit" className="console-btn console-btn--primary" disabled={busy}>
              Create
            </button>
          </form>

          <p>
            <Link href="/platform">← Overview</Link>
          </p>
        </PlatformShell>
      </main>
    </div>
  );
}
