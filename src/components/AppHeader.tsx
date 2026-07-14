"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAuth } from "@/components/providers/AuthProvider";

export function AppHeader({
  tag,
  showAuthCta = true,
}: {
  tag?: string;
  showAuthCta?: boolean;
}) {
  const { user, loading } = useAuth();

  return (
    <header className="app-header">
      <Link href="/" className="app-header__brand">
        <span className="app-header__logo">SpotSync</span>
        {tag ? <span className="app-header__tag">{tag}</span> : null}
      </Link>
      <div className="app-header__actions">
        <ThemeToggle />
        {!loading && user ? (
          <>
            <NotificationBell />
            <Link href="/account" className="console-btn console-btn--ghost">
              {user.name.split(" ")[0] ?? "Account"}
            </Link>
          </>
        ) : showAuthCta ? (
          <Link href="/login" className="console-btn console-btn--primary">
            Sign in
          </Link>
        ) : null}
      </div>
    </header>
  );
}
