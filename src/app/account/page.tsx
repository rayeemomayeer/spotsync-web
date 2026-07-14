"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api/client";
import { formatCents } from "@/lib/checkout/client";
import { getToken } from "@/lib/auth/session";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const token = getToken();

  const paymentsQuery = useQuery({
    queryKey: ["my-payments"],
    queryFn: () => api.myPayments(token ?? ""),
    enabled: !!user && !!token,
  });

  return (
    <div className="shell">
      <AppHeader tag="Account" showAuthCta={!user} />
      <main className="shell-main">
        <div className="shell-card">
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
                  Role: <code>{user.role}</code>
                </p>
              </section>

              <section className="account-section">
                <h2>Payment history</h2>
                {paymentsQuery.isLoading ? <p>Loading payments…</p> : null}
                {paymentsQuery.isError ? (
                  <p className="auth-card__error">Could not load payments.</p>
                ) : null}
                <ul className="console-zone-list">
                  {(paymentsQuery.data ?? []).length === 0 && !paymentsQuery.isLoading ? (
                    <li className="shell-card" style={{ boxShadow: "none" }}>
                      <p style={{ margin: 0 }}>No payments yet.</p>
                    </li>
                  ) : (
                    (paymentsQuery.data ?? []).map((p) => (
                      <li key={p.id} className="shell-card" style={{ boxShadow: "none" }}>
                        <strong>{formatCents(p.amount_cents)}</strong> · {p.status}
                        <p style={{ margin: "0.35rem 0", fontSize: "0.85rem" }}>
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
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
