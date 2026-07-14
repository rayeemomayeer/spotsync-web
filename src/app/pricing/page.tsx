import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PricingSlider } from "@/components/marketing/PricingSlider";
import { siteConfig } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: `Pricing — ${siteConfig.name}`,
  description: "SpotSync org subscriptions: scale zones with an interactive plan slider (Stripe test mode).",
};

export default function PricingPage() {
  return (
    <div className="shell shell--pricing">
      <AppHeader tag="Pricing" />
      <main className="shell-main shell-main--narrow">
        <PricingSlider />
        <p className="pricing-page-footer">
          <Link href="/">← Home</Link>
        </p>
      </main>
      <MarketingFooter />
    </div>
  );
}
