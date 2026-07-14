"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { NavExploreMenu } from "@/components/NavDropdown";
import { useAuth } from "@/components/providers/AuthProvider";
import { homePathForRole, primaryNavLinks } from "@/lib/auth/roles";

export function AppHeader({
  tag,
  showAuthCta = true,
}: {
  tag?: string;
  showAuthCta?: boolean;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const links = primaryNavLinks(user?.role);

  return (
    <header className="app-header">
      <div className="app-header__glass">
        <Link href={user ? homePathForRole(user.role) : "/"} className="app-header__brand">
          <span className="app-header__mark" aria-hidden>
            <span className="app-header__mark-pulse" />
          </span>
          <span className="app-header__logo">SpotSync</span>
          {tag ? <span className="app-header__tag">{tag}</span> : null}
        </Link>

        <nav className="app-header__nav" aria-label="Main">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(`${link.href}/`));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`app-header__link${active ? " app-header__link--active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
          {!loading ? <NavExploreMenu user={user} /> : null}
        </nav>

        <div className="app-header__actions">
          <div className="app-header__mobile-menu">
            {!loading ? <NavExploreMenu user={user} /> : null}
          </div>
          <ThemeToggle />
          {!loading && user ? (
            <>
              <NotificationBell />
              <Link href="/account" className="app-header__cta app-header__cta--ghost">
                {user.name.split(" ")[0] ?? "Account"}
              </Link>
            </>
          ) : showAuthCta ? (
            <Link href="/login" className="app-header__cta">
              Sign in
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
