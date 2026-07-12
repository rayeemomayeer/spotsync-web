import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

export default function HomePage() {
  return (
    <div className="landing">
      <AppHeader showAuthCta={false} />
      <main className="landing-hero">
        <h1 className="landing-hero__brand">SpotSync</h1>
        <p className="landing-hero__headline">Park like you ride — book a spot before you arrive.</p>
        <p className="landing-hero__sub">
          Live availability for drivers. Dense ops for orgs. One marketplace, no guesswork.
        </p>
        <div className="landing-hero__cta">
          <Link href="/login" className="console-btn console-btn--primary">
            Sign in / Get started
          </Link>
          <Link href="/console" className="console-btn console-btn--ghost" style={{ color: "#e8eef0", borderColor: "rgba(232,238,240,0.25)" }}>
            Live console
          </Link>
        </div>
      </main>
    </div>
  );
}
