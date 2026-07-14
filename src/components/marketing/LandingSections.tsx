import { JourneyPath } from "@/components/marketing/JourneyPath";
import { EditorialFeatures } from "@/components/marketing/EditorialFeatures";
import { AudienceSplit } from "@/components/marketing/AudienceSplit";
import { PricingSlider } from "@/components/marketing/PricingSlider";
import { LiveMarketplace } from "@/components/marketing/LiveMarketplace";
import { StackPulse } from "@/components/marketing/StackPulse";
import { LandingFaq } from "@/components/marketing/LandingFaq";

/**
 * Landing body sections (hero lives in page.tsx).
 */
export function LandingSections() {
  return (
    <>
      <LiveMarketplace />
      <JourneyPath />
      <EditorialFeatures />
      <AudienceSplit />
      <StackPulse />
      <section className="landing-pricing" aria-labelledby="landing-pricing-heading">
        <h2 id="landing-pricing-heading" className="visually-hidden">
          Pricing for operators
        </h2>
        <PricingSlider compact showDriverNote={false} />
      </section>
      <LandingFaq />
    </>
  );
}

