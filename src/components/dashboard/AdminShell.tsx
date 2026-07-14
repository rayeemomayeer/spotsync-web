"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export type AdminNavItem = {
  href: string;
  label: string;
  hint?: string;
};

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/platform" || href === "/org") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  nav,
  pathname,
  onNavigate,
  variant,
}: {
  nav: AdminNavItem[];
  pathname: string;
  onNavigate?: () => void;
  variant: "rail" | "chips" | "sheet";
}) {
  return (
    <>
      {nav.map((item) => {
        const active = isActivePath(pathname, item.href);
        const className =
          variant === "rail"
            ? `admin-dash__nav-link${active ? " admin-dash__nav-link--active" : ""}`
            : variant === "chips"
              ? `admin-dash__chip${active ? " admin-dash__chip--active" : ""}`
              : `admin-dash__sheet-link${active ? " admin-dash__sheet-link--active" : ""}`;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={className}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
          >
            {variant === "rail" ? (
              <>
                <span>{item.label}</span>
                {item.hint ? <span className="admin-dash__nav-hint">{item.hint}</span> : null}
              </>
            ) : (
              item.label
            )}
          </Link>
        );
      })}
    </>
  );
}

export function AdminShell({
  title,
  subtitle,
  nav,
  children,
  eyebrow = "Operations",
}: {
  title: string;
  subtitle?: string;
  nav: AdminNavItem[];
  children: React.ReactNode;
  eyebrow?: string;
}) {
  const pathname = usePathname();
  const sheetId = useId();
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setSheetOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  return (
    <div className="admin-dash">
      <aside className="admin-dash__rail" aria-label="Dashboard">
        <p className="admin-dash__eyebrow">{eyebrow}</p>
        <nav className="admin-dash__nav">
          <NavLinks nav={nav} pathname={pathname} variant="rail" />
        </nav>
      </aside>

      <div className="admin-dash__main">
        <header className="admin-dash__hero">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <p className="admin-dash__eyebrow">{eyebrow}</p>
            <h1 className="admin-dash__title">{title}</h1>
            {subtitle ? <p className="admin-dash__sub">{subtitle}</p> : null}
          </motion.div>
        </header>

        <div className="admin-dash__mobile-bar">
          <button
            type="button"
            className="admin-dash__menu-btn"
            aria-expanded={sheetOpen}
            aria-controls={sheetId}
            onClick={() => setSheetOpen((o) => !o)}
          >
            {sheetOpen ? "Close menu" : "Sections"}
          </button>
          <nav className="admin-dash__chips" aria-label="Dashboard sections">
            <NavLinks nav={nav} pathname={pathname} variant="chips" />
          </nav>
        </div>

        {sheetOpen ? (
          <div className="admin-dash__sheet-root">
            <button
              type="button"
              className="admin-dash__sheet-backdrop"
              aria-label="Close menu"
              onClick={() => setSheetOpen(false)}
            />
            <nav id={sheetId} className="admin-dash__sheet" aria-label="Dashboard menu">
              <p className="admin-dash__eyebrow">{eyebrow}</p>
              <NavLinks
                nav={nav}
                pathname={pathname}
                variant="sheet"
                onNavigate={() => setSheetOpen(false)}
              />
            </nav>
          </div>
        ) : null}

        <motion.div
          className="admin-dash__body"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

export const PLATFORM_NAV: AdminNavItem[] = [
  { href: "/platform", label: "Overview", hint: "KPIs" },
  { href: "/platform/orgs", label: "Organizations", hint: "Approve" },
  { href: "/platform/users", label: "Users", hint: "Accounts" },
  { href: "/platform/zones", label: "Zones", hint: "Create" },
  { href: "/platform/observe", label: "Observe", hint: "Health + metrics" },
  { href: "/platform/audit", label: "Audit", hint: "Trail" },
  { href: "/platform/billing", label: "Billing", hint: "Stripe test" },
];

export const ORG_NAV: AdminNavItem[] = [
  { href: "/org", label: "Overview", hint: "Capacity" },
  { href: "/org/zones", label: "Zones", hint: "Create" },
  { href: "/org/members", label: "Members", hint: "Users" },
  { href: "/org/observe", label: "Observe", hint: "Org metrics" },
  { href: "/org/audit", label: "Audit", hint: "Trail" },
  { href: "/org/billing", label: "Billing", hint: "Plan" },
];
