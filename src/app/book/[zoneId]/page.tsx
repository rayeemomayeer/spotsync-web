"use client";

import { Suspense, useCallback, useEffect, useMemo, useState, FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api/client";
import {
  createPaymentIntent,
  confirmDemoCheckout,
  fetchCheckoutQuote,
  formatCents,
  type CheckoutQuote,
} from "@/lib/checkout/client";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { PriceBreakdown } from "@/components/checkout/PriceBreakdown";
import { isFeatureEnabled } from "@/lib/config/flags";
import { getToken, isDemoModeActive } from "@/lib/auth/session";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

function CheckoutForm(props: {
  zoneId: number;
  quote: CheckoutQuote;
  clientSecret: string;
  onPaid: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError("");
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/book/${props.zoneId}?paid=1`,
      },
      redirect: "if_required",
    });
    if (result.error) {
      setError(result.error.message ?? "Payment failed");
      setBusy(false);
      return;
    }
    props.onPaid();
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="shell-card" style={{ boxShadow: "none" }}>
      <p>
        Total: <strong>{formatCents(props.quote.amount_cents)}</strong> · {props.quote.duration_hours}h
      </p>
      <PaymentElement />
      {error ? <p className="auth-card__error">{error}</p> : null}
      <button type="submit" className="console-btn console-btn--primary" disabled={!stripe || busy}>
        {busy ? "Processing…" : "Pay & reserve"}
      </button>
      <p style={{ fontSize: "0.85rem", opacity: 0.75 }}>
        Test card <code>4242 4242 4242 4242</code> · any future expiry · any CVC
      </p>
    </form>
  );
}

export default function BookZonePage() {
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

  const [plate, setPlate] = useState("ABC-1234");
  const [duration, setDuration] = useState(1);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
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

  async function startPayment() {
    if (!quote) return;
    setBusy(true);
    setError("");
    try {
      if (isDemoModeActive()) {
        await confirmDemoCheckout({
          zone_id: zoneId,
          duration_hours: duration,
          license_plate: plate.trim(),
          spot_id: spotId,
        });
        await onPaid();
        return;
      }
      const pi = await createPaymentIntent({
        zone_id: zoneId,
        duration_hours: duration,
        license_plate: plate.trim(),
        spot_id: spotId,
      });
      setClientSecret(pi.client_secret);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment setup failed");
    } finally {
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

  const elementsOptions = useMemo(
    () => (clientSecret ? { clientSecret } : null),
    [clientSecret],
  );

  const step = clientSecret ? "payment" : "details";

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
        <div className="shell-card checkout-layout">
          <CheckoutStepper step={step} />
          <h1>Book {zoneName || `zone #${zoneId}`}</h1>
          {spotId ? (
            <p style={{ marginTop: 0, color: "var(--muted)" }}>
              Spot #{spotId} selected
            </p>
          ) : null}
          {loading ? (
            <p>Loading session…</p>
          ) : !user ? (
            <p>
              Sign in to pay & reserve. <Link href="/login">Sign in</Link>
            </p>
          ) : (
            <div className="checkout-layout__grid">
              <div>
                <label style={{ display: "grid", gap: "0.35rem", marginBottom: "0.75rem" }}>
                  License plate
                  <input className="ui-input" value={plate} onChange={(e) => setPlate(e.target.value)} required minLength={1} />
                </label>
                <label style={{ display: "grid", gap: "0.35rem", marginBottom: "0.75rem" }}>
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
                {error ? <p className="auth-card__error">{error}</p> : null}

                {!clientSecret ? (
                  <button
                    type="button"
                    className="console-btn console-btn--primary"
                    disabled={busy || !quote || !stripePromise}
                    onClick={() => void startPayment()}
                  >
                    {busy ? "Preparing…" : isDemoModeActive() ? "Confirm demo booking" : "Continue to payment"}
                  </button>
                ) : elementsOptions && stripePromise ? (
                  <Elements stripe={stripePromise} options={elementsOptions}>
                    <CheckoutForm
                      zoneId={zoneId}
                      quote={quote!}
                      clientSecret={clientSecret}
                      onPaid={() => void onPaid()}
                    />
                  </Elements>
                ) : null}

                <p style={{ marginTop: "1rem" }}>
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
