"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api/client";
import { getBffUrl } from "@/lib/auth/client";
import { clearToken } from "@/lib/auth/session";
import { homePathForRole, isOrgAdmin, isPlatformAdmin } from "@/lib/auth/roles";
import { toast } from "@/lib/toast";

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export default function ApplyOrgPage() {
  const { user, token, loading, refresh } = useAuth();
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
      return;
    }
    if (isOrgAdmin(user.role)) {
      void api
        .orgMe(token)
        .then(() => router.replace("/org"))
        .catch(() => {
          /* no org yet — stay and apply */
        });
    }
  }, [loading, user, token, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push(`/login?as=org&next=${encodeURIComponent("/apply")}`);
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
      clearToken();
      await refresh();
      setDone(true);
      toast.success("Application submitted", "Pending platform approval");
      router.replace("/org");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Application failed";
      setError(msg);
      toast.error("Application failed", msg);
      setBusy(false);
    }
  }

  return (
    <div className="shell">
      <AppHeader tag="Organization" showAuthCta={!user} />
      <main className="shell-main page-surface">
        <h1>Organization application</h1>
        <p className="page-surface__lede">
          Register your garage. After a platform admin approves and you subscribe (Starter or Growth),
          you can create zones and spots.
        </p>
        <ol className="auth-org-steps auth-org-steps--page">
          <li>Organization account</li>
          <li>This application (pending)</li>
          <li>Admin approval</li>
          <li>Subscribe → zones &amp; spots</li>
        </ol>

        {loading ? (
          <p>Loading…</p>
        ) : !user ? (
          <div className="dash-empty">
            <p>Sign in with an organization account first (or create one).</p>
            <p className="dash-cta-row">
              <Link
                href={`/login?as=org&next=${encodeURIComponent("/apply")}`}
                className="console-btn console-btn--primary console-btn--pill"
              >
                Organization sign in
              </Link>
              <Link
                href={`/signup?as=org&next=${encodeURIComponent("/apply")}`}
                className="console-btn console-btn--ghost console-btn--pill"
              >
                Create organization account
              </Link>
            </p>
          </div>
        ) : done ? (
          <p className="status-ok">Application submitted — opening org dashboard…</p>
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
              Starts as <code>pending</code>. Admins approve on <code>/platform/orgs</code>. Then open{" "}
              <Link href="/org/billing">Billing</Link> before zone create.
            </p>
            <button
              type="submit"
              className="console-btn console-btn--primary console-btn--pill"
              disabled={busy}
            >
              {busy ? "Submitting…" : "Submit organization application"}
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
