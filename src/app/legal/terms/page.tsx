import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { siteConfig } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: `Terms of Service — ${siteConfig.name}`,
  description: "SpotSync terms of service for the portfolio demonstration.",
};

export default function TermsPage() {
  return (
    <div className="shell">
      <AppHeader tag="Legal" />
      <main className="shell-main">
        <article className="page-prose legal-doc">
          <h1>Terms of Service</h1>
          <p className="legal-doc__updated">Last updated: July 2026 · Portfolio demonstration only</p>

          <p>
            By using SpotSync demo environments you agree to these terms. This is sample legal text for a portfolio
            project — not legal advice.
          </p>

          <h2>Service</h2>
          <p>
            SpotSync provides a parking reservation marketplace demonstration. Features, availability, and pricing may
            change without notice in demo environments.
          </p>

          <h2>Accounts</h2>
          <p>
            You are responsible for credentials on your account. Do not use production passwords. Demo accounts may be
            reset or removed.
          </p>

          <h2>Payments</h2>
          <p>
            Driver payments and org subscriptions run in Stripe <strong>test mode</strong> only. No real funds are
            collected in the portfolio deployment.
          </p>

          <h2>Operator obligations</h2>
          <p>
            Organizations must maintain accurate capacity, honor confirmed reservations, and comply with applicable local
            parking regulations in a production deployment.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            The demo is provided &quot;as is&quot; without warranties. The maintainer is not liable for lost revenue,
            towing, or missed appointments arising from demo use.
          </p>

          <h2>Governing law</h2>
          <p>These terms are governed by the laws applicable to the project maintainer&apos;s jurisdiction.</p>

          <p>
            <Link href="/legal/privacy">Privacy Policy →</Link> · <Link href="/">Home</Link>
          </p>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}
