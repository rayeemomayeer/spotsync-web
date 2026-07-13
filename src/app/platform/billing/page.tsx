"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/components/providers/AuthProvider";
import { isPlatformAdmin } from "@/lib/auth/roles";
import { getBffUrl } from "@/lib/auth/client";

function BillingInner() {
  const { user, loading } = useAuth();
  const search = useSearchParams();
  const allowed = user && isPlatformAdmin(user.role);
  const stripeEnabled = process.env.NEXT_PUBLIC_FEATURE_FLAGS?.includes("stripe_billing") ?? false;
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
      <main className="shell-main">
        <div className="shell-card">
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
                <p style={{ color: "var(--ok, #1a7f37)" }}>Checkout completed (test). Confirm webhook in BFF logs.</p>
              ) : null}
              {checkoutState === "cancel" ? <p>Checkout cancelled.</p> : null}
              {error ? <p className="auth-card__error">{error}</p> : null}
              <ul className="console-zone-list">
                <li className="shell-card" style={{ boxShadow: "none" }}>
                  <strong>Starter</strong>
                  <p style={{ margin: "0.35rem 0" }}>Org zone publishing — Stripe test price.</p>
                  <button
                    type="button"
                    className="console-btn console-btn--primary"
                    disabled={!stripeEnabled || busy != null}
                    onClick={() => void startCheckout("starter")}
                  >
                    {busy === "starter" ? "Redirecting…" : "Subscribe (test)"}
                  </button>
                </li>
                <li className="shell-card" style={{ boxShadow: "none" }}>
                  <strong>Growth</strong>
                  <p style={{ margin: "0.35rem 0" }}>Higher capacity + webhook fan-out — Stripe test price.</p>
                  <button
                    type="button"
                    className="console-btn console-btn--primary"
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
        </div>
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
