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
        { href: "/how-it-works", label: "How it works", description: "Trip + operator flow" },
        { href: "/pricing", label: "Pricing", description: "Starter / Growth slider" },
      ],
    },
    {
      title: "Builders",
      items: [
        { href: "/developers", label: "Developers", description: "API surface" },
        { href: "/legal/privacy", label: "Privacy", description: "Data practices" },
        { href: "/legal/terms", label: "Terms", description: "Demo terms" },
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
  const shared: NavMenuItem[] = [
    { href: homePathForRole(user.role), label: "Role home", description: role ?? "driver" },
    { href: "/search", label: "Search zones", description: "List + map browse" },
    { href: "/account", label: "Account", description: "Profile + payments" },
  ];

  if (role === "driver") {
    return [
      {
        title: "Driver",
        items: [
          ...shared,
          { href: "/driver", label: "Driver map", description: "Map-first booking" },
          { href: "/reservations", label: "My reservations", description: "Cancel / refund" },
          { href: "/console", label: "Live console", description: "Ops three-column UI" },
        ],
      },
      {
        title: "Resources",
        items: [
          { href: "/how-it-works", label: "How it works", description: "Product guide" },
          { href: "/pricing", label: "Pricing", description: "Operator plans" },
        ],
      },
    ];
  }

  if (isOrgAdmin(user.role)) {
    return [
      {
        title: "Organization",
        items: [
          ...shared,
          { href: "/org", label: "Overview", description: "Capacity charts" },
          { href: "/org/zones", label: "Zones", description: "Create inventory" },
          { href: "/org/members", label: "Members", description: "Team users" },
          { href: "/org/observe", label: "Observe", description: "Health + Grafana" },
          { href: "/org/billing", label: "Billing", description: "Stripe test" },
          { href: "/console", label: "Live console", description: "Ops grid" },
        ],
      },
      {
        title: "Resources",
        items: [
          { href: "/pricing", label: "Pricing", description: "Plans" },
          { href: "/developers", label: "Developers", description: "API notes" },
        ],
      },
    ];
  }

  if (isPlatformAdmin(user.role)) {
    return [
      {
        title: "Platform",
        items: [
          ...shared,
          { href: "/platform", label: "Overview", description: "Marketplace KPIs" },
          { href: "/platform/orgs", label: "Organizations", description: "Approve orgs" },
          { href: "/platform/zones", label: "Zones", description: "Inventory" },
          { href: "/platform/observe", label: "Observe", description: "Health · Grafana" },
          { href: "/platform/audit", label: "Audit", description: "Org audit log" },
          { href: "/platform/billing", label: "Billing", description: "Stripe test" },
        ],
      },
      {
        title: "Ops",
        items: [
          { href: "/console", label: "Live console", description: "Spot grid" },
          { href: "/driver", label: "Driver map", description: "Preview driver UX" },
          { href: "/developers", label: "Developers", description: "API notes" },
        ],
      },
    ];
  }

  return [{ title: "Workspace", items: shared }];
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
                  <li key={`${group.title}-${item.href}`}>
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
    const role = normalizeRole(user.role);
    const label =
      role === "saas_admin" ? "Platform menu" : role === "org_admin" ? "Org menu" : "More";
    return <NavDropdown label={label} groups={workspaceGroups(user)} />;
  }
  return <NavDropdown label="Explore" groups={publicExploreGroups()} />;
}
