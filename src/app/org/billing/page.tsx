"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/components/providers/AuthProvider";
import { api, ApiError } from "@/lib/api/client";
import type { Organization } from "@/lib/api/types";
import { isOrgAdmin } from "@/lib/auth/roles";
import { getBffUrl } from "@/lib/auth/client";
import { isFeatureEnabled } from "@/lib/config/flags";

function OrgBillingInner() {
  const { user, token, loading } = useAuth();
  const search = useSearchParams();
  const allowed = user && isOrgAdmin(user.role);
  const stripeEnabled = isFeatureEnabled("stripe_billing");
  const checkoutState = search.get("checkout");
  const [org, setOrg] = useState<Organization | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!allowed) return;
    setError("");
    try {
      const me = await api.orgMe(token);
      setOrg(me);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load org");
    }
  }, [allowed, token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function startCheckout(plan: "starter" | "growth") {
    setBusy(plan);
    setError("");
    try {
      const res = await fetch(`${getBffUrl()}/api/stripe/checkout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        message?: string;
        data?: { url?: string };
      };
      if (!res.ok || !json.success || !json.data?.url) {
        throw new Error(json.message ?? "Checkout failed");
      }
      window.location.href = json.data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setBusy(null);
    }
  }

  async function openPortal() {
    setBusy("portal");
    setError("");
    try {
      const res = await fetch(`${getBffUrl()}/api/stripe/portal`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = (await res.json()) as {
        success?: boolean;
        message?: string;
        data?: { url?: string };
      };
      if (!res.ok || !json.success || !json.data?.url) {
        throw new Error(json.message ?? "Portal failed");
      }
      window.location.href = json.data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Portal failed");
      setBusy(null);
    }
  }

  const canSubscribe = org?.status === "active";

  return (
    <div className="shell">
      <AppHeader tag="Org billing" showAuthCta={!user} />
      <main className="shell-main">
        <div className="shell-card">
          <h1>Org billing</h1>
          {loading ? (
            <p>Loading…</p>
          ) : !user ? (
            <p>
              Org admins only. <Link href="/login">Sign in</Link>
            </p>
          ) : !allowed ? (
            <p>Role gate: org_admin required.</p>
          ) : (
            <>
              {org ? (
                <p>
                  <strong>{org.name}</strong> · status <code>{org.status}</code>
                  {org.billing_plan ? (
                    <>
                      {" "}
                      · plan <code>{org.billing_plan}</code>
                    </>
                  ) : null}
                </p>
              ) : null}
              {org?.status === "pending" ? (
                <p>Platform approval pending — subscribe after approval.</p>
              ) : null}
              {checkoutState === "success" ? (
                <p style={{ color: "var(--ok, #1a7f37)" }}>Checkout completed (test).</p>
              ) : null}
              {checkoutState === "cancel" ? <p>Checkout cancelled.</p> : null}
              {error ? <p className="auth-card__error">{error}</p> : null}
              <ul className="console-zone-list">
                <li className="shell-card" style={{ boxShadow: "none" }}>
                  <strong>Starter</strong>
                  <button
                    type="button"
                    className="console-btn console-btn--primary"
                    disabled={!stripeEnabled || !canSubscribe || busy != null}
                    onClick={() => void startCheckout("starter")}
                  >
                    {busy === "starter" ? "Redirecting…" : "Subscribe (test)"}
                  </button>
                </li>
                <li className="shell-card" style={{ boxShadow: "none" }}>
                  <strong>Growth</strong>
                  <button
                    type="button"
                    className="console-btn console-btn--primary"
                    disabled={!stripeEnabled || !canSubscribe || busy != null}
                    onClick={() => void startCheckout("growth")}
                  >
                    {busy === "growth" ? "Redirecting…" : "Subscribe (test)"}
                  </button>
                </li>
              </ul>
              {org?.stripe_customer_id ? (
                <button
                  type="button"
                  className="console-btn console-btn--ghost"
                  disabled={busy != null}
                  onClick={() => void openPortal()}
                >
                  {busy === "portal" ? "Opening…" : "Manage subscription (portal)"}
                </button>
              ) : null}
              <p style={{ marginTop: "1rem" }}>
                <Link href="/pricing">Compare plans →</Link> · <Link href="/org">← Org</Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function OrgBillingPage() {
  return (
    <Suspense
      fallback={
        <div className="shell">
          <main className="shell-main">
            <p>Loading…</p>
          </main>
        </div>
      }
    >
      <OrgBillingInner />
    </Suspense>
  );
}
