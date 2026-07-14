import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { siteConfig } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: `Privacy Policy — ${siteConfig.name}`,
  description: "SpotSync privacy policy for the portfolio demonstration.",
};

export default function PrivacyPage() {
  return (
    <div className="shell">
      <AppHeader tag="Legal" />
      <main className="shell-main">
        <article className="shell-card legal-doc">
          <h1>Privacy Policy</h1>
          <p className="legal-doc__updated">Last updated: July 2026 · Portfolio demonstration only</p>

          <p>
            This policy describes how SpotSync (&quot;we&quot;, &quot;the demo&quot;) would handle information in a
            production deployment. This site is a technical portfolio project, not a commercial service offering.
          </p>

          <h2>Information we collect</h2>
          <ul>
            <li>
              <strong>Account data:</strong> name, email, and role when you register via Better Auth on the BFF.
            </li>
            <li>
              <strong>Booking data:</strong> license plate, zone selections, and payment metadata (Stripe test mode).
            </li>
            <li>
              <strong>Technical data:</strong> standard server logs, request IDs, and optional error telemetry (e.g.
              Sentry) when configured.
            </li>
          </ul>

          <h2>How we use information</h2>
          <p>We use data to authenticate users, fulfill reservations, prevent overselling, and operate the marketplace demo.</p>

          <h2>Sharing</h2>
          <p>
            Payment processing is handled by Stripe (test mode). Infrastructure may include Render, Vercel, and Neon
            Postgres. We do not sell personal information.
          </p>

          <h2>Retention</h2>
          <p>
            Demo session data can be reset via Demo Mode. Production retention would follow operator policy and legal
            requirements.
          </p>

          <h2>Your rights</h2>
          <p>
            Contact the project maintainer for access or deletion requests related to demo accounts. EU/UK GDPR rights
            would apply in a live EU-facing product.
          </p>

          <h2>Contact</h2>
          <p>
            Questions: use the repository issue tracker linked from the{" "}
            <Link href="/developers">developer portal</Link>.
          </p>

          <p>
            <Link href="/legal/terms">Terms of Service →</Link> · <Link href="/">Home</Link>
          </p>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}
