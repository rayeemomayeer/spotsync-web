"use client";

import { Suspense, useCallback, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/components/providers/AuthProvider";
import { api, ApiError } from "@/lib/api/client";
import { refundPayment } from "@/lib/checkout/client";
import { isFeatureEnabled } from "@/lib/config/flags";
import { getToken } from "@/lib/auth/session";

function paymentChip(status?: string | null) {
  if (!status) return <span>unpaid</span>;
  if (status === "succeeded") return <span style={{ color: "var(--ok, #1a7f37)" }}>paid</span>;
  if (status === "refunded") return <span>refunded</span>;
  return <span>{status}</span>;
}

function ReservationsInner() {
  const { user, token, loading } = useAuth();
  const search = useSearchParams();
  const qc = useQueryClient();
  const authToken = token ?? getToken();
  const paymentsOn = isFeatureEnabled("driver_payments");
  const booked = search.get("booked");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ["my-reservations"],
    queryFn: () => api.myReservations(authToken ?? ""),
    enabled: !!user && !!authToken,
  });

  const onCancelRefund = useCallback(
    async (reservationId: number, paymentId?: number) => {
      if (!paymentsOn || !paymentId) {
        setBusyId(reservationId);
        setError("");
        try {
          await api.cancelReservation(authToken ?? "", reservationId);
          await qc.invalidateQueries({ queryKey: ["my-reservations"] });
        } catch (e) {
          setError(e instanceof ApiError ? e.message : "Cancel failed");
        } finally {
          setBusyId(null);
        }
        return;
      }

      setBusyId(reservationId);
      setError("");
      try {
        await refundPayment(paymentId);
        await qc.invalidateQueries({ queryKey: ["my-reservations"] });
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Refund failed");
      } finally {
        setBusyId(null);
      }
    },
    [authToken, paymentsOn, qc],
  );

  return (
    <div className="shell">
      <AppHeader tag="Reservations" showAuthCta={!user} />
      <main className="shell-main">
        <div className="shell-card">
          <h1>My reservations</h1>
          {loading || isLoading ? (
            <p>Loading…</p>
          ) : !user ? (
            <p>
              <Link href="/login">Sign in</Link> to view bookings.
            </p>
          ) : (
            <>
              {booked === "1" ? (
                <p style={{ color: "var(--ok, #1a7f37)" }}>Payment received — reservation confirmed.</p>
              ) : null}
              {booked === "pending" ? (
                <p>Payment received — confirming reservation (refresh in a moment)…</p>
              ) : null}
              {error ? <p className="auth-card__error">{error}</p> : null}
              <ul className="receipt-list">
                {reservations.length === 0 ? (
                  <li className="receipt-card receipt-card--empty">
                    <p>No reservations yet.</p>
                  </li>
                ) : (
                  reservations.map((r) => (
                    <li key={r.id} className="receipt-card">
                      <div className="receipt-card__head">
                        <strong>{r.zone?.name ?? `Zone #${r.zone_id}`}</strong>
                        <span className="receipt-card__status">{r.status}</span>
                      </div>
                      <p className="receipt-card__meta">
                        <span className="font-mono">{r.license_plate}</span>
                        {" · "}
                        {paymentChip(r.payment_status)}
                      </p>
                      {r.status === "active" ? (
                        <button
                          type="button"
                          className="console-btn console-btn--ghost"
                          disabled={busyId === r.id}
                          onClick={() => void onCancelRefund(r.id, r.payment_id ?? undefined)}
                        >
                          {busyId === r.id
                            ? "Working…"
                            : paymentsOn && r.payment_id
                              ? "Cancel & refund"
                              : "Cancel"}
                        </button>
                      ) : null}
                    </li>
                  ))
                )}
              </ul>
              <Link href="/driver">← Driver map</Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ReservationsPage() {
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
      <ReservationsInner />
    </Suspense>
  );
}
