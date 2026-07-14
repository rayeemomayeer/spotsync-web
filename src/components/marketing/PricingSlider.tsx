"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type PlanId = "starter" | "growth";

const plans: Record<
  PlanId,
  {
    name: string;
    price: number;
    minZones: number;
    maxZones: number;
    blurb: string;
    features: string[];
  }
> = {
  starter: {
    name: "Starter",
    price: 49,
    minZones: 1,
    maxZones: 5,
    blurb: "Publish your first garages on the marketplace.",
    features: ["Up to 5 zones", "Org admin dashboard", "Stripe test billing", "Email support (portfolio)"],
  },
  growth: {
    name: "Growth",
    price: 149,
    minZones: 6,
    maxZones: 40,
    blurb: "Scale inventory and webhook fan-out.",
    features: ["Unlimited zones", "Webhook fan-out", "Priority SSE capacity", "Platform audit visibility"],
  },
};

function planForZones(zones: number): PlanId {
  return zones <= 5 ? "starter" : "growth";
}

export function PricingSlider({
  showDriverNote = true,
  compact = false,
}: {
  showDriverNote?: boolean;
  compact?: boolean;
}) {
  const [zones, setZones] = useState(5);
  const planId = planForZones(zones);
  const plan = plans[planId];

  const fill = useMemo(() => ((zones - 1) / 39) * 100, [zones]);

  return (
    <div className={`pricing-slider${compact ? " pricing-slider--compact" : ""}`}>
      {!compact ? (
        <>
          <h1 className="pricing-slider__title">Price to the inventory you run</h1>
          <p className="pricing-slider__lede">
            Drivers pay per reservation. Operators subscribe by scale. Slide zones — plan updates.
            Stripe <strong>test mode</strong> only on this deploy.
          </p>
        </>
      ) : (
        <>
          <p className="pricing-slider__eyebrow">Operators</p>
          <h2 className="pricing-slider__title">Scale decides the plan</h2>
        </>
      )}

      <div className="pricing-slider__control">
        <label htmlFor="pricing-zones" className="pricing-slider__label">
          Zones you publish
          <span className="pricing-slider__zones font-mono">{zones}</span>
        </label>
        <input
          id="pricing-zones"
          type="range"
          min={1}
          max={40}
          value={zones}
          onChange={(e) => setZones(Number(e.target.value))}
          className="pricing-slider__range"
          style={{ ["--fill" as string]: `${fill}%` }}
          aria-valuetext={`${zones} zones — ${plan.name} plan`}
        />
        <div className="pricing-slider__ticks" aria-hidden>
          <span>1</span>
          <span>5 Starter</span>
          <span>40+</span>
        </div>
      </div>

      <div className="pricing-slider__result" aria-live="polite">
        <div className="pricing-slider__plan-meta">
          <span className="pricing-slider__plan-name">{plan.name}</span>
          <p className="pricing-slider__plan-blurb">{plan.blurb}</p>
        </div>
        <p className="pricing-slider__amount">
          <span className="font-mono">${plan.price}</span>
          <span className="pricing-slider__period">/mo</span>
        </p>
      </div>

      <ul className="pricing-slider__features">
        {plan.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      <Link href="/org/billing" className="console-btn console-btn--primary console-btn--pill">
        Subscribe (test)
      </Link>

      {showDriverNote ? (
        <p className="pricing-slider__note">
          Need approval first? <Link href="/how-it-works">How onboarding works</Link>
          {" · "}
          <Link href="/search">Find parking as a driver</Link>
        </p>
      ) : (
        <p className="pricing-slider__note">
          <Link href="/pricing">Full pricing →</Link>
        </p>
      )}
    </div>
  );
}
