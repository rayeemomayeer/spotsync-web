"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  homePathForRole,
  isOrgAdmin,
  isPlatformAdmin,
  normalizeRole,
} from "@/lib/auth/roles";
import type { User } from "@/lib/api/types";

export type NavMenuItem = {
  href: string;
  label: string;
  description?: string;
};

export type NavMenuGroup = {
  title: string;
  items: NavMenuItem[];
};

function publicExploreGroups(): NavMenuGroup[] {
  return [
    {
      title: "Discover",
      items: [
        { href: "/search", label: "Find parking", description: "Live zone list + map" },
        { href: "/driver", label: "Driver map", description: "Map-first booking" },
        { href: "/how-it-works", label: "How it works", description: "Trip + operator flow" },
      ],
    },
    {
      title: "Operators",
      items: [
        { href: "/pricing", label: "Pricing", description: "Starter / Growth slider" },
        { href: "/developers", label: "API surface", description: "Graded endpoints" },
      ],
    },
    {
      title: "Account",
      items: [
        { href: "/login", label: "Sign in", description: "BFF session" },
        { href: "/signup", label: "Create account", description: "Driver signup" },
      ],
    },
  ];
}

function workspaceGroups(user: User): NavMenuGroup[] {
  const role = normalizeRole(user.role);
  const items: NavMenuItem[] = [
    { href: homePathForRole(user.role), label: "Home for role", description: role ?? "driver" },
    { href: "/driver", label: "Driver map", description: "Book with live grid" },
    { href: "/search", label: "Search zones", description: "List + map browse" },
    { href: "/reservations", label: "My reservations", description: "Cancel / refund" },
    { href: "/account", label: "Account", description: "Profile + payments" },
    { href: "/console", label: "Live console", description: "Ops three-column UI" },
  ];

  if (isOrgAdmin(user.role)) {
    items.push(
      { href: "/org", label: "Org dashboard", description: "Zones & members" },
      { href: "/org/billing", label: "Org billing", description: "Stripe test subscribe" },
    );
  }

  if (isPlatformAdmin(user.role)) {
    items.push(
      { href: "/platform", label: "Platform", description: "Marketplace KPIs" },
      { href: "/platform/orgs", label: "Organizations", description: "Approve orgs" },
      { href: "/platform/health", label: "Health", description: "BFF + Go probes" },
    );
  }

  return [
    {
      title: "Workspace",
      items,
    },
    {
      title: "Resources",
      items: [
        { href: "/pricing", label: "Pricing", description: "Operator plans" },
        { href: "/developers", label: "Developers", description: "API notes" },
        { href: "/how-it-works", label: "How it works", description: "Product guide" },
      ],
    },
  ];
}

export function NavDropdown({
  label,
  groups,
}: {
  label: string;
  groups: NavMenuGroup[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const btnId = useId();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) close();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open, close]);

  return (
    <div className={`nav-dd${open ? " nav-dd--open" : ""}`} ref={rootRef}>
      <button
        type="button"
        id={btnId}
        className="nav-dd__trigger"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <span className="nav-dd__chevron" aria-hidden>
          ▾
        </span>
      </button>
      <div
        id={panelId}
        role="menu"
        aria-labelledby={btnId}
        className="nav-dd__panel"
        hidden={!open}
      >
        {groups.map((group) => (
          <div key={group.title} className="nav-dd__group" role="group" aria-label={group.title}>
            <p className="nav-dd__group-title">{group.title}</p>
            <ul className="nav-dd__list">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      role="menuitem"
                      className={`nav-dd__item${active ? " nav-dd__item--active" : ""}`}
                      onClick={close}
                    >
                      <span className="nav-dd__item-label">{item.label}</span>
                      {item.description ? (
                        <span className="nav-dd__item-desc">{item.description}</span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NavExploreMenu({ user }: { user: User | null }) {
  if (user) {
    return <NavDropdown label="Workspace" groups={workspaceGroups(user)} />;
  }
  return <NavDropdown label="Explore" groups={publicExploreGroups()} />;
}
