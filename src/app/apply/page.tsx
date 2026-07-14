"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/components/providers/AuthProvider";
import { getBffUrl } from "@/lib/auth/client";
import { clearToken } from "@/lib/auth/session";
import { homePathForRole, isPlatformAdmin } from "@/lib/auth/roles";

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export default function ApplyOrgPage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  useEffect(() => {
    if (loading || !user) return;
    if (isPlatformAdmin(user.role)) {
      router.replace("/platform/orgs");
    }
  }, [loading, user, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push(`/login?next=${encodeURIComponent("/apply")}`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${getBffUrl()}/api/orgs/apply`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim() }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        message?: string;
        errors?: Record<string, string>;
        data?: { id: number; status: string; name: string };
      };
      if (!res.ok || !json.success) {
        throw new Error(
          json.errors?.slug ??
            json.errors?.organization ??
            json.errors?.name ??
            json.errors?.goUserId ??
            json.message ??
            "Application failed",
        );
      }
      // Drop any stale Go JWT so cookie session (org_admin) wins.
      clearToken();
      await refresh();
      setDone(true);
      router.replace("/org");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Application failed");
      setBusy(false);
    }
  }

  return (
    <div className="shell">
      <AppHeader tag="Apply" showAuthCta={!user} />
      <main className="shell-main page-surface">
        <h1>Apply as garage operator</h1>
        <p className="page-surface__lede">
          Create your organization. A platform admin must approve before you can publish zones
          or subscribe. After approval, pick a plan on Billing.
        </p>

        {loading ? (
          <p>Loading…</p>
        ) : !user ? (
          <div className="dash-empty">
            <p>Sign in (or create a driver account) first, then apply.</p>
            <p>
              <Link
                href={`/login?next=${encodeURIComponent("/apply")}`}
                className="console-btn console-btn--primary console-btn--pill"
              >
                Sign in
              </Link>{" "}
              <Link
                href={`/signup?next=${encodeURIComponent("/apply")}`}
                className="console-btn console-btn--ghost console-btn--pill"
              >
                Create account
              </Link>
            </p>
          </div>
        ) : done ? (
          <p className="status-ok">Application submitted — redirecting to org dashboard…</p>
        ) : (
          <form onSubmit={(e) => void onSubmit(e)} className="account-section" style={{ maxWidth: "28rem" }}>
            {error ? <p className="auth-card__error">{error}</p> : null}
            <label>
              Garage / company name
              <Input
                required
                minLength={2}
                maxLength={255}
                placeholder="North Ramp Garage"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={busy}
              />
            </label>
            <label>
              Slug (URL-safe id)
              <Input
                required
                minLength={2}
                maxLength={100}
                pattern="[a-z0-9-]+"
                placeholder="north-ramp"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value.toLowerCase());
                }}
                disabled={busy}
              />
            </label>
            <p className="dash-table__meta">
              Status after submit: <code>pending</code> until a saas admin approves on{" "}
              <code>/platform/orgs</code>.
            </p>
            <button
              type="submit"
              className="console-btn console-btn--primary console-btn--pill"
              disabled={busy}
            >
              {busy ? "Submitting…" : "Submit application"}
            </button>
            <p>
              <Link href={homePathForRole(user.role)}>← Back</Link>
            </p>
          </form>
        )}
      </main>
    </div>
  );
}
