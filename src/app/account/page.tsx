"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/AppHeader";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api/client";
import { formatCents } from "@/lib/checkout/client";
import { getToken } from "@/lib/auth/session";

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const token = getToken();
  const [signingOut, setSigningOut] = useState(false);

  const paymentsQuery = useQuery({
    queryKey: ["my-payments"],
    queryFn: () => api.myPayments(token ?? ""),
    enabled: !!user && !!token,
  });

  async function onSignOut() {
    setSigningOut(true);
    try {
      await logout();
      router.replace("/login");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="shell">
      <AppHeader tag="Account" showAuthCta={!user} />
      <main className="shell-main page-surface">
        <h1>Account</h1>
        {loading ? (
          <p>Loading…</p>
        ) : !user ? (
          <p>
            <Link href="/login">Sign in</Link> to view your profile.
          </p>
        ) : (
          <>
            <section className="account-section">
              <h2>Profile</h2>
              <p>
                <strong>{user.name}</strong>
                <br />
                {user.email}
                <br />
                Role: <Badge tone="muted">{user.role}</Badge>
              </p>
              <button
                type="button"
                className="console-btn console-btn--ghost console-btn--pill"
                disabled={signingOut}
                onClick={() => void onSignOut()}
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </section>

            <section className="account-section">
              <h2>Payment history</h2>
              {paymentsQuery.isLoading ? <p>Loading payments…</p> : null}
              {paymentsQuery.isError ? (
                <p className="auth-card__error">Could not load payments.</p>
              ) : null}
              <ul className="receipt-list">
                {(paymentsQuery.data ?? []).length === 0 && !paymentsQuery.isLoading ? (
                  <li className="receipt-card receipt-card--empty">
                    <p>No payments yet.</p>
                  </li>
                ) : (
                  (paymentsQuery.data ?? []).map((p) => (
                    <li key={p.id} className="receipt-card">
                      <div className="receipt-card__head">
                        <strong className="font-mono">{formatCents(p.amount_cents)}</strong>
                        <Badge tone={p.status === "succeeded" ? "success" : "muted"}>{p.status}</Badge>
                      </div>
                      <p className="receipt-card__meta font-mono">
                        {p.stripe_payment_intent_id}
                        {p.reservation_id ? ` · reservation #${p.reservation_id}` : ""}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </section>

            <p>
              <Link href="/reservations">My reservations →</Link> · <Link href="/driver">Driver map</Link>
              {user.role === "driver" ? (
                <>
                  {" · "}
                  <Link href="/login?as=org">Organization sign in</Link>
                  {" / "}
                  <Link href="/apply">Apply for garage</Link>
                </>
              ) : null}
            </p>
          </>
        )}
      </main>
    </div>
  );
}
