"use client";

import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/components/providers/AuthProvider";
import { isPlatformAdmin } from "@/lib/auth/roles";

/** Stripe test-mode billing surface (portfolio). Wire checkout via BFF when FEATURE_FLAGS=stripe_billing. */
export default function BillingPage() {
  const { user, loading } = useAuth();
  const allowed = user && isPlatformAdmin(user.role);
  const stripeEnabled = process.env.NEXT_PUBLIC_FEATURE_FLAGS?.includes("stripe_billing") ?? false;

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
              <ul className="console-zone-list">
                <li className="shell-card" style={{ boxShadow: "none" }}>
                  <strong>Starter</strong>
                  <p style={{ margin: "0.35rem 0 0" }}>Org zone publishing — test price placeholder.</p>
                </li>
                <li className="shell-card" style={{ boxShadow: "none" }}>
                  <strong>Growth</strong>
                  <p style={{ margin: "0.35rem 0 0" }}>Higher capacity + webhook fan-out — test price placeholder.</p>
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
