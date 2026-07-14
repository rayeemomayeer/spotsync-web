import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { siteConfig } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: `Pricing — ${siteConfig.name}`,
  description: "SpotSync org subscriptions: Starter and Growth plans for parking operators (Stripe test mode).",
};

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "$49",
    period: "/mo",
    blurb: "Launch your first zones on the marketplace.",
    features: ["Up to 5 zones", "Org admin dashboard", "Stripe test billing", "Email support (portfolio)"],
    cta: { href: "/org/billing", label: "Subscribe (test)" },
  },
  {
    id: "growth",
    name: "Growth",
    price: "$149",
    period: "/mo",
    blurb: "Scale inventory and webhook integrations.",
    features: [
      "Unlimited zones",
      "Webhook fan-out",
      "Priority SSE capacity",
      "Platform audit visibility",
    ],
    cta: { href: "/org/billing", label: "Subscribe (test)" },
    featured: true,
  },
];

export default function PricingPage() {
  return (
    <div className="shell">
      <AppHeader tag="Pricing" />
      <main className="shell-main">
        <div className="shell-card pricing-page">
          <h1>Simple plans for operators</h1>
          <p>
            Drivers pay per reservation. Organizations subscribe to publish zones. All billing runs in{" "}
            <strong>Stripe test mode</strong> on this deployment.
          </p>

          <div className="pricing-grid">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={`pricing-card${plan.featured ? " pricing-card--featured" : ""}`}
              >
                {plan.featured ? <span className="pricing-card__badge">Popular</span> : null}
                <h2>{plan.name}</h2>
                <p className="pricing-card__price">
                  {plan.price}
                  <span>{plan.period}</span>
                </p>
                <p className="pricing-card__blurb">{plan.blurb}</p>
                <ul>
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <Link href={plan.cta.href} className="console-btn console-btn--primary">
                  {plan.cta.label}
                </Link>
              </article>
            ))}
          </div>

          <p className="pricing-page__note">
            Need platform approval first?{" "}
            <Link href="/how-it-works">See how onboarding works</Link> or contact a platform admin.
          </p>
          <p>
            <Link href="/search">Find parking as a driver →</Link> · <Link href="/">Home</Link>
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
