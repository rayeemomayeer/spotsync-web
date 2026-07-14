import { getBffUrl } from "@/lib/auth/client";

type CheckoutEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
};

export type CheckoutQuote = {
  zone_id: number;
  zone_name: string;
  duration_hours: number;
  amount_cents: number;
  currency: string;
  line_items: { description: string; amount_cents: number }[];
  license_plate: string;
};

export type PaymentIntentData = {
  client_secret: string;
  payment_intent_id: string;
  amount_cents: number;
  currency: string;
};

async function checkoutRequest<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getBffUrl()}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as CheckoutEnvelope<T>;
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.message ?? "Checkout request failed");
  }
  return json.data;
}

export function fetchCheckoutQuote(body: {
  zone_id: number;
  duration_hours: number;
  license_plate: string;
}) {
  return checkoutRequest<CheckoutQuote>("/api/checkout/quote", body);
}

export function createPaymentIntent(body: {
  zone_id: number;
  duration_hours: number;
  license_plate: string;
  spot_id?: number;
}) {
  return checkoutRequest<PaymentIntentData>("/api/checkout/payment-intent", body);
}

export async function refundPayment(paymentId: number): Promise<void> {
  const res = await fetch(`${getBffUrl()}/api/payments/${paymentId}/refund`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const json = (await res.json()) as CheckoutEnvelope<unknown>;
  if (!res.ok || !json.success) {
    throw new Error(json.message ?? "Refund failed");
  }
}

export function formatCents(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}
