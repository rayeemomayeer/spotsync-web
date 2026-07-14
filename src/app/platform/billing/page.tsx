"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/components/providers/AuthProvider";
import { isPlatformAdmin } from "@/lib/auth/roles";
import { getBffUrl } from "@/lib/auth/client";
import { isFeatureEnabled } from "@/lib/config/flags";

function BillingInner() {
  const { user, loading } = useAuth();
  const search = useSearchParams();
  const allowed = user && isPlatformAdmin(user.role);
  const stripeEnabled = isFeatureEnabled("stripe_billing");
  const checkoutState = search.get("checkout");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

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

  return (
    <div className="shell">
      <AppHeader tag="Billing" showAuthCta={!user} />
      <main className="shell-main page-surface">
        <h1>Billing (Stripe test)</h1>
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
              Stripe runs in <strong>test mode</strong> only. Webhooks hit the Express BFF at{" "}
              <code>/api/stripe/webhook</code>.
            </p>
            <p>
              Feature flag <code>stripe_billing</code>: {stripeEnabled ? "enabled" : "disabled (env)"}
            </p>
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
                  disabled={!stripeEnabled || busy != null}
                  onClick={() => void startCheckout("starter")}
                >
                  {busy === "starter" ? "Redirecting…" : "Subscribe (test)"}
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
                  disabled={!stripeEnabled || busy != null}
                  onClick={() => void startCheckout("growth")}
                >
                  {busy === "growth" ? "Redirecting…" : "Subscribe (test)"}
                </button>
              </li>
            </ul>
            <Link href="/platform">← Platform</Link>
          </>
        )}
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
