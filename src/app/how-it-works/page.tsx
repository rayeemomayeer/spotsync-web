import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { siteConfig } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: `How it works — ${siteConfig.name}`,
  description: "Learn how SpotSync connects drivers and parking operators with live availability and pay-then-reserve.",
};

export default function HowItWorksPage() {
  return (
    <div className="shell">
      <AppHeader tag="How it works" />
      <main className="shell-main">
        <article className="shell-card legal-doc">
          <h1>How SpotSync works</h1>
          <p>
            SpotSync is a two-sided parking marketplace. Drivers discover and pay for spots; operators publish
            inventory after platform approval and subscription.
          </p>

          <h2>For drivers</h2>
          <ol>
            <li>Search by location on the homepage or driver map.</li>
            <li>Select a zone and spot with live availability (SSE updates).</li>
            <li>Pay via Stripe test checkout — reservation is created only after payment succeeds.</li>
            <li>Manage bookings on <Link href="/reservations">My reservations</Link>; cancel for a test refund.</li>
          </ol>

          <h2>For operators</h2>
          <ol>
            <li>Platform admin creates and approves your organization.</li>
            <li>Subscribe on <Link href="/pricing">Starter or Growth</Link>.</li>
            <li>Publish zones, set hourly rates, and monitor occupancy in the org console.</li>
          </ol>

          <h2>For platform admins</h2>
          <p>
            Approve orgs, manage billing, and audit marketplace activity from the{" "}
            <Link href="/platform">platform dashboard</Link>.
          </p>

          <p>
            <Link href="/search">Find parking →</Link> · <Link href="/">Home</Link>
          </p>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}
