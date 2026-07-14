"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isPlatformAdmin } from "@/lib/auth/roles";
import { useAuth } from "@/components/providers/AuthProvider";

const links = [
  { href: "/platform", label: "Overview" },
  { href: "/platform/orgs", label: "Organizations" },
  { href: "/platform/audit", label: "Audit" },
  { href: "/platform/health", label: "Health" },
  { href: "/platform/billing", label: "Billing" },
];

export function PlatformNav() {
  const pathname = usePathname();
  return (
    <nav className="platform-nav" aria-label="Platform">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`platform-nav__link${pathname === l.href ? " platform-nav__link--active" : ""}`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

export function PlatformGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const allowed = user && isPlatformAdmin(user.role);

  if (loading) return <p>Loading session…</p>;
  if (!user) {
    return (
      <p>
        Sign in as saas_admin. <Link href="/login">Sign in</Link>
      </p>
    );
  }
  if (!allowed) {
    return <p>Role gate: saas_admin required. Your role: {user.role}</p>;
  }
  return children;
}

export function PlatformShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <PlatformGate>
      <PlatformNav />
      <h1>{title}</h1>
      {children}
    </PlatformGate>
  );
}
