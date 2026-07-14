"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { AdminShell, PLATFORM_NAV } from "@/components/dashboard/AdminShell";
import { useAuth } from "@/components/providers/AuthProvider";
import { api, ApiError } from "@/lib/api/client";
import type { Organization } from "@/lib/api/types";
import { isPlatformAdmin } from "@/lib/auth/roles";
import { getBffUrl } from "@/lib/auth/client";
import { isFeatureEnabled } from "@/lib/config/flags";

function BillingInner() {
  const { user, token, loading } = useAuth();
  const search = useSearchParams();
  const allowed = user && isPlatformAdmin(user.role);
  const stripeEnabled = isFeatureEnabled("stripe_billing");
  const checkoutState = search.get("checkout");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [orgId, setOrgId] = useState<number | "">("");

  const loadOrgs = useCallback(async () => {
    if (!allowed) return;
    try {
      const list = await api.orgs(token);
      setOrgs(list.filter((o) => o.status === "active"));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load orgs");
    }
  }, [allowed, token]);

  useEffect(() => {
    void loadOrgs();
  }, [loadOrgs]);

  const selected = useMemo(
    () => (orgId === "" ? null : orgs.find((o) => o.id === orgId) ?? null),
    [orgId, orgs],
  );

  async function startCheckout(plan: "starter" | "growth") {
    if (orgId === "") {
      setError("Pick an organization first");
      return;
    }
    setBusy(plan);
    setError("");
    try {
      const res = await fetch(`${getBffUrl()}/api/stripe/checkout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, organization_id: orgId }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        message?: string;
        errors?: Record<string, string>;
        data?: { url?: string };
      };
      if (!res.ok || !json.success || !json.data?.url) {
        throw new Error(
          json.errors?.plan ?? json.errors?.organization_id ?? json.errors?.stripe ?? json.message ?? "Checkout failed",
        );
      }
      window.location.href = json.data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setBusy(null);
    }
  }

  async function openPortal() {
    if (orgId === "") {
      setError("Pick an organization first");
      return;
    }
    setBusy("portal");
    setError("");
    try {
      const res = await fetch(`${getBffUrl()}/api/stripe/portal`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organization_id: orgId }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        message?: string;
        errors?: Record<string, string>;
        data?: { url?: string };
      };
      if (!res.ok || !json.success || !json.data?.url) {
        throw new Error(json.errors?.stripe ?? json.message ?? "Portal failed");
      }
      window.location.href = json.data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Portal failed");
      setBusy(null);
    }
  }

  return (
    <div className="shell">
      <AppHeader tag="Billing" showAuthCta={!user} />
      <main className="shell-main shell-main--wide">
        <AdminShell
          eyebrow="Platform"
          title="Billing"
          subtitle="Stripe test mode — attach a plan to a specific org."
          nav={PLATFORM_NAV}
        >
        {loading ? (
          <p>Loading…</p>
        ) : !user ? (
          <p>
            Platform admins only. <Link href="/login">Sign in</Link>
          </p>
        ) : !allowed ? (
          <p>Role gate: saas_admin required.</p>
        ) : (
          <>
            <p>
              Checkout always sets <code>organization_id</code> so the webhook can update{" "}
              <code>billing_plan</code>. Cancel / unpaid subscriptions clear the plan.
            </p>
            <p>
              Feature flag <code>stripe_billing</code>: {stripeEnabled ? "enabled" : "disabled (env)"}
            </p>
            <label style={{ display: "grid", gap: "0.35rem", margin: "1rem 0", maxWidth: "28rem" }}>
              <span className="dash-table__meta">Organization</span>
              <select
                className="console-input console-input--select"
                value={orgId === "" ? "" : String(orgId)}
                onChange={(e) => setOrgId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">Select active org…</option>
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.slug})
                    {o.billing_plan ? ` · ${o.billing_plan}` : ""}
                  </option>
                ))}
              </select>
            </label>
            {selected ? (
              <p>
                Current plan: <code>{selected.billing_plan ?? "none"}</code>
                {selected.stripe_customer_id ? (
                  <>
                    {" "}
                    · Stripe customer linked
                  </>
                ) : null}
              </p>
            ) : null}
            {checkoutState === "success" ? (
              <p className="status-ok">Checkout completed (test). Confirm webhook in BFF logs.</p>
            ) : null}
            {checkoutState === "cancel" ? <p>Checkout cancelled.</p> : null}
            {error ? <p className="auth-card__error">{error}</p> : null}
            <ul className="receipt-list">
              <li className="receipt-card">
                <div className="receipt-card__head">
                  <strong>Starter</strong>
                  <span className="font-mono">$49/mo</span>
                </div>
                <p className="receipt-card__meta">Org zone publishing — Stripe test price.</p>
                <button
                  type="button"
                  className="console-btn console-btn--primary console-btn--pill"
                  disabled={
                    !stripeEnabled ||
                    busy != null ||
                    orgId === "" ||
                    selected?.billing_plan === "starter"
                  }
                  onClick={() => void startCheckout("starter")}
                >
                  {busy === "starter"
                    ? "Redirecting…"
                    : selected?.billing_plan === "starter"
                      ? "Already on Starter"
                      : "Subscribe (test)"}
                </button>
              </li>
              <li className="receipt-card">
                <div className="receipt-card__head">
                  <strong>Growth</strong>
                  <span className="font-mono">$149/mo</span>
                </div>
                <p className="receipt-card__meta">Higher capacity + webhook fan-out — Stripe test price.</p>
                <button
                  type="button"
                  className="console-btn console-btn--primary console-btn--pill"
                  disabled={
                    !stripeEnabled ||
                    busy != null ||
                    orgId === "" ||
                    selected?.billing_plan === "growth"
                  }
                  onClick={() => void startCheckout("growth")}
                >
                  {busy === "growth"
                    ? "Redirecting…"
                    : selected?.billing_plan === "growth"
                      ? "Already on Growth"
                      : "Subscribe (test)"}
                </button>
              </li>
            </ul>
            {selected?.stripe_customer_id ? (
              <button
                type="button"
                className="console-btn console-btn--ghost"
                disabled={busy != null || orgId === ""}
                onClick={() => void openPortal()}
              >
                {busy === "portal" ? "Opening…" : "Manage subscription (portal)"}
              </button>
            ) : null}
            <Link href="/platform">← Platform</Link>
          </>
        )}
        </AdminShell>
      </main>
    </div>
  );
}

/** Stripe test-mode billing surface (portfolio). Checkout via BFF when prices configured. */
export default function BillingPage() {
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
      <BillingInner />
    </Suspense>
  );
}
