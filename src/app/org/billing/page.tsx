"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { AdminShell, ORG_NAV } from "@/components/dashboard/AdminShell";
import { useAuth } from "@/components/providers/AuthProvider";
import { api, ApiError } from "@/lib/api/client";
import type { Organization } from "@/lib/api/types";
import { isOrgAdmin } from "@/lib/auth/roles";
import { getBffUrl } from "@/lib/auth/client";
import { isFeatureEnabled, usesHostedCheckout } from "@/lib/config/flags";
import { EntitlementBanner } from "@/components/dashboard/EntitlementBanner";
import { orgEntitlement } from "@/lib/org/entitlement";
import { toast } from "@/lib/toast";
import { AppPageLoader } from "@/components/ui/AppPageLoader";

function OrgBillingInner() {
  const { user, token, loading } = useAuth();
  const search = useSearchParams();
  const allowed = user && isOrgAdmin(user.role);
  const stripeEnabled = isFeatureEnabled("stripe_billing");
  const hosted = usesHostedCheckout();
  const checkoutState = search.get("checkout");
  const [org, setOrg] = useState<Organization | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const entitlement = orgEntitlement(org);

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

  useEffect(() => {
    if (checkoutState === "success") toast.success("Subscription updated");
    if (checkoutState === "cancel") toast.info("Checkout cancelled");
  }, [checkoutState]);

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
        errors?: Record<string, string>;
        data?: { url?: string };
      };
      if (!res.ok || !json.success || !json.data?.url) {
        throw new Error(
          json.errors?.plan ?? json.errors?.stripe ?? json.message ?? "Checkout failed",
        );
      }
      toast.info("Redirecting to Stripe…");
      window.location.href = json.data.url;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Checkout failed";
      setError(msg);
      toast.error("Checkout failed", msg);
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
      toast.info("Opening billing portal…");
      window.location.href = json.data.url;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Portal failed";
      setError(msg);
      toast.error("Portal failed", msg);
      setBusy(null);
    }
  }

  const canSubscribe = org?.status === "active";

  return (
    <div className="shell">
      <AppHeader tag="Org billing" showAuthCta={!user} />
      <main className="shell-main shell-main--wide">
        <AdminShell
          eyebrow="Organization"
          title="Billing"
          subtitle={
            hosted
              ? "Hosted Stripe Checkout (test) unlocks zone capacity after approval."
              : "Stripe test subscriptions for org capacity."
          }
          nav={ORG_NAV}
        >
        {loading ? (
          <p>Loading…</p>
        ) : !user ? (
          <div className="dash-empty">
            <p>Org admins only.</p>
            <Link href="/login" className="console-btn console-btn--primary console-btn--pill">
              Sign in
            </Link>
          </div>
        ) : !allowed ? (
          <p className="dash-empty">Role gate: org_admin required.</p>
        ) : (
          <>
            <EntitlementBanner state={entitlement} />
            {!stripeEnabled ? (
              <aside className="entitle-banner" role="status">
                <div className="entitle-banner__body">
                  <p className="entitle-banner__title">Billing flag off</p>
                  <p className="entitle-banner__text">
                    Enable <code>stripe_billing</code> in{" "}
                    <code>NEXT_PUBLIC_FEATURE_FLAGS</code> to run hosted Checkout.
                  </p>
                </div>
              </aside>
            ) : null}
            {org ? (
              <p>
                <strong>{org.name}</strong> · status <code>{org.status}</code>
                {org.billing_plan ? (
                  <>
                    {" "}
                    · plan <code>{org.billing_plan}</code>
                  </>
                ) : (
                  <> · plan <code>none</code></>
                )}
              </p>
            ) : (
              <p className="dash-empty">No organization linked to this account yet.</p>
            )}
            {checkoutState === "success" ? (
              <p className="status-ok">Checkout completed (test). Refresh if plan still empty.</p>
            ) : null}
            {checkoutState === "cancel" ? <p>Checkout cancelled — no charge.</p> : null}
            {error ? <p className="auth-card__error">{error}</p> : null}
            {!canSubscribe && org ? (
              <p className="dash-empty">
                Subscribe unlocks after status is <code>active</code>. Ask a platform admin to
                approve first.
              </p>
            ) : null}
            {org?.billing_plan ? (
              <p className="dash-table__meta">
                Same-plan re-checkout blocked. Use portal to cancel or change seats; pick the other
                plan to upgrade/downgrade via Checkout.
              </p>
            ) : null}
            <ul className="receipt-list">
              <li className="receipt-card">
                <div className="receipt-card__head">
                  <strong>Starter</strong>
                  <span className="font-mono">$49/mo</span>
                </div>
                <p className="dash-table__meta">Small garage · hosted Checkout</p>
                <button
                  type="button"
                  className="console-btn console-btn--primary console-btn--pill"
                  disabled={
                    !stripeEnabled ||
                    !canSubscribe ||
                    busy != null ||
                    org?.billing_plan === "starter"
                  }
                  onClick={() => void startCheckout("starter")}
                >
                  {busy === "starter"
                    ? "Redirecting…"
                    : org?.billing_plan === "starter"
                      ? "Already on Starter"
                      : "Subscribe (test)"}
                </button>
              </li>
              <li className="receipt-card">
                <div className="receipt-card__head">
                  <strong>Growth</strong>
                  <span className="font-mono">$149/mo</span>
                </div>
                <p className="dash-table__meta">Multi-zone capacity · hosted Checkout</p>
                <button
                  type="button"
                  className="console-btn console-btn--primary console-btn--pill"
                  disabled={
                    !stripeEnabled ||
                    !canSubscribe ||
                    busy != null ||
                    org?.billing_plan === "growth"
                  }
                  onClick={() => void startCheckout("growth")}
                >
                  {busy === "growth"
                    ? "Redirecting…"
                    : org?.billing_plan === "growth"
                      ? "Already on Growth"
                      : "Subscribe (test)"}
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
            <p>
              <Link href="/pricing">Compare plans →</Link> · <Link href="/org">← Org</Link>
            </p>
          </>
        )}
        </AdminShell>
      </main>
    </div>
  );
}

export default function OrgBillingPage() {
  return (
    <Suspense fallback={<AppPageLoader label="Loading billing" />}>
      <OrgBillingInner />
    </Suspense>
  );
}
