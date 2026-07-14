"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export type AdminNavItem = {
  href: string;
  label: string;
  hint?: string;
};

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

  return (
    <div className="admin-dash">
      <aside className="admin-dash__rail" aria-label="Dashboard">
        <p className="admin-dash__eyebrow">{eyebrow}</p>
        <nav className="admin-dash__nav">
          {nav.map((item) => {
            const active =
              item.href === "/platform" || item.href === "/org"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-dash__nav-link${active ? " admin-dash__nav-link--active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span>{item.label}</span>
                {item.hint ? <span className="admin-dash__nav-hint">{item.hint}</span> : null}
              </Link>
            );
          })}
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
  { href: "/platform/observe", label: "Observe", hint: "Health" },
  { href: "/platform/grafana", label: "Grafana", hint: "Metrics" },
  { href: "/platform/audit", label: "Audit", hint: "Trail" },
  { href: "/platform/billing", label: "Billing", hint: "Stripe test" },
];

export const ORG_NAV: AdminNavItem[] = [
  { href: "/org", label: "Overview", hint: "Capacity" },
  { href: "/org/zones", label: "Zones", hint: "Create" },
  { href: "/org/members", label: "Members", hint: "Users" },
  { href: "/org/observe", label: "Observe", hint: "Health" },
  { href: "/org/audit", label: "Audit", hint: "Trail" },
  { href: "/org/billing", label: "Billing", hint: "Plan" },
];
