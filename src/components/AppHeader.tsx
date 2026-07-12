"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AppHeader({
  tag,
  showAuthCta = true,
}: {
  tag?: string;
  showAuthCta?: boolean;
}) {
  return (
    <header className="app-header">
      <Link href="/" className="app-header__brand">
        <span className="app-header__logo">SpotSync</span>
        {tag ? <span className="app-header__tag">{tag}</span> : null}
      </Link>
      <div className="app-header__actions">
        <ThemeToggle />
        {showAuthCta ? (
          <Link href="/login" className="console-btn console-btn--primary">
            Sign in
          </Link>
        ) : null}
      </div>
    </header>
  );
}
