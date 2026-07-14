import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

export default function PricingPage() {
  return (
    <div className="shell">
      <AppHeader tag="Pricing" />
      <main className="shell-main">
        <div className="shell-card">
          <h1>Pricing</h1>
          <p>SpotSync org subscriptions — Stripe test mode only.</p>
          <ul className="console-zone-list">
            <li className="shell-card" style={{ boxShadow: "none" }}>
              <strong>Starter</strong>
              <p style={{ margin: "0.35rem 0" }}>Publish parking zones, basic ops dashboard.</p>
            </li>
            <li className="shell-card" style={{ boxShadow: "none" }}>
              <strong>Growth</strong>
              <p style={{ margin: "0.35rem 0" }}>Higher capacity, webhook fan-out, priority support (portfolio).</p>
            </li>
          </ul>
          <p>
            <Link href="/org/billing">Org subscribe →</Link> · <Link href="/">Home</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
