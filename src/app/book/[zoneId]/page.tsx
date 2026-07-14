"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api/client";
import {
  createCheckoutSession,
  confirmDemoCheckout,
  fetchCheckoutQuote,
  formatCents,
  type CheckoutQuote,
} from "@/lib/checkout/client";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { PriceBreakdown } from "@/components/checkout/PriceBreakdown";
import { isFeatureEnabled } from "@/lib/config/flags";
import { getToken, isDemoModeActive } from "@/lib/auth/session";
import { toast } from "@/lib/toast";
import { AppPageLoader } from "@/components/ui/AppPageLoader";

export default function BookZonePage() {
  return (
    <Suspense fallback={<AppPageLoader label="Loading checkout" />}>
      <BookZoneInner />
    </Suspense>
  );
}

function BookZoneInner() {
  const params = useParams<{ zoneId: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const zoneId = Number(params.zoneId);
  const spotId = search.get("spot") ? Number(search.get("spot")) : undefined;
  const paidFlag = search.get("paid") === "1";
  const canceled = search.get("checkout") === "cancel";

  const [plate, setPlate] = useState("ABC-1234");
  const [duration, setDuration] = useState(1);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [zoneName, setZoneName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const paymentsOn = isFeatureEnabled("driver_payments");
  const authToken = token ?? getToken();

  const loadQuote = useCallback(async () => {
    if (!Number.isFinite(zoneId) || zoneId < 1) return;
    setBusy(true);
    setError("");
    try {
      const z = await api.zone(zoneId);
      setZoneName(z.name);
      const q = await fetchCheckoutQuote({
        zone_id: zoneId,
        duration_hours: duration,
        license_plate: plate.trim(),
      });
      setQuote(q);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Quote failed");
    } finally {
      setBusy(false);
    }
  }, [zoneId, duration, plate]);

  useEffect(() => {
    void loadQuote();
  }, [loadQuote]);

  async function startStripeCheckout() {
    if (!quote) return;
    setBusy(true);
    setError("");
    try {
      const session = await createCheckoutSession({
        zone_id: zoneId,
        duration_hours: duration,
        license_plate: plate.trim(),
        spot_id: spotId,
      });
      window.location.assign(session.url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Checkout failed";
      setError(msg);
      toast.error("Checkout failed", msg);
      setBusy(false);
    }
  }

  async function startDemoConfirm() {
    setBusy(true);
    setError("");
    try {
      await confirmDemoCheckout({
        zone_id: zoneId,
        duration_hours: duration,
        license_plate: plate.trim(),
        spot_id: spotId,
      });
      toast.success("Booking confirmed");
      await onPaid();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Demo booking failed";
      setError(msg);
      toast.error("Booking failed", msg);
      setBusy(false);
    }
  }

  const onPaid = useCallback(async () => {
    for (let i = 0; i < 8; i++) {
      await new Promise((r) => setTimeout(r, 800));
      const list = await api.myReservations(authToken ?? "");
      if (list.some((r) => r.zone_id === zoneId && r.status === "active")) {
        router.push("/reservations?booked=1");
        return;
      }
    }
    router.push("/reservations?booked=pending");
  }, [authToken, router, zoneId]);

  useEffect(() => {
    if (paidFlag) void onPaid();
  }, [paidFlag, onPaid]);

  if (!paymentsOn) {
    return (
      <div className="shell">
        <AppHeader tag="Book" />
        <main className="shell-main">
          <p>
            Driver payments disabled. Enable <code>driver_payments</code> feature flag.
          </p>
          <Link href="/driver">← Driver map</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="shell">
      <AppHeader tag="Checkout" showAuthCta={!user} />
      <main className="shell-main">
        <div className="page-surface checkout-layout">
          <CheckoutStepper step={paidFlag ? "payment" : "details"} />
          <h1>Book {zoneName || `zone #${zoneId}`}</h1>
          {spotId ? <p className="checkout-spot-note">Spot #{spotId} selected</p> : null}
          {canceled ? <p className="auth-card__error">Checkout cancelled — try again when ready.</p> : null}
          {paidFlag ? <p className="status-ok">Payment received — confirming reservation…</p> : null}
          {loading ? (
            <p>Loading session…</p>
          ) : !user ? (
            <p>
              Sign in to pay & reserve. <Link href="/login">Sign in</Link>
            </p>
          ) : (
            <div className="checkout-layout__grid">
              <div>
                <label className="checkout-field">
                  License plate
                  <input
                    className="ui-input"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    required
                    minLength={1}
                  />
                </label>
                <label className="checkout-field">
                  Duration (hours)
                  <input
                    className="ui-input"
                    type="number"
                    min={1}
                    max={24}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                  />
                </label>
                {quote ? (
                  <p>
                    Total: <strong className="font-mono">{formatCents(quote.amount_cents)}</strong> ·{" "}
                    {quote.duration_hours}h
                  </p>
                ) : null}
                {error ? <p className="auth-card__error">{error}</p> : null}

                {!paidFlag ? (
                  <div className="checkout-actions">
                    <button
                      type="button"
                      className="console-btn console-btn--primary console-btn--pill"
                      disabled={busy || !quote}
                      onClick={() => void startStripeCheckout()}
                    >
                      {busy ? "Opening Stripe…" : "Pay with Stripe (test)"}
                    </button>
                    {isDemoModeActive() ? (
                      <button
                        type="button"
                        className="console-btn console-btn--ghost console-btn--pill"
                        disabled={busy || !quote}
                        onClick={() => void startDemoConfirm()}
                      >
                        Skip — demo booking
                      </button>
                    ) : null}
                  </div>
                ) : null}

                <p className="checkout-pay-form__hint">
                  Opens Stripe Checkout (test mode). Card <code>4242 4242 4242 4242</code> · any future
                  expiry · any CVC.
                </p>

                <p className="checkout-back">
                  <Link href="/driver">← Back to map</Link>
                </p>
              </div>
              {quote ? <PriceBreakdown quote={quote} /> : null}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
