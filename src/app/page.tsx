import type { Metadata } from "next";
import Script from "next/script";
import { AppHeader } from "@/components/AppHeader";
import { HeroSearch } from "@/components/marketing/HeroSearch";
import { LandingSections } from "@/components/marketing/LandingSections";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { organizationJsonLd, siteConfig, webSiteJsonLd } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  alternates: { canonical: siteConfig.url },
};

export default function HomePage() {
  const jsonLd = [organizationJsonLd(), webSiteJsonLd()];

  return (
    <div className="landing">
      <Script
        id="spotsync-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AppHeader />
      <main>
        <HeroSearch />
        <LandingSections />
      </main>
      <MarketingFooter />
    </div>
  );
}
