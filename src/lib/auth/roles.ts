export type AppRole = "saas_admin" | "org_admin" | "driver" | "admin";

export type NavLink = {
  href: string;
  label: string;
};

/** Roles allowed for a protected prefix. Missing prefix = public. */
const PROTECTED_ROUTES: { prefix: string; roles: AppRole[] }[] = [
  { prefix: "/platform", roles: ["saas_admin"] },
  { prefix: "/org", roles: ["org_admin", "saas_admin"] },
  { prefix: "/console", roles: ["driver", "org_admin", "saas_admin"] },
  { prefix: "/driver", roles: ["driver", "org_admin", "saas_admin"] },
  { prefix: "/reservations", roles: ["driver", "org_admin", "saas_admin"] },
  { prefix: "/account", roles: ["driver", "org_admin", "saas_admin"] },
  { prefix: "/book", roles: ["driver", "org_admin", "saas_admin"] },
];

export function normalizeRole(role: string | undefined | null): AppRole | null {
  if (!role) return null;
  const r = role.toLowerCase().trim();
  if (r === "admin" || r === "saas_admin" || r === "platform_admin") return "saas_admin";
  if (r === "org_admin" || r === "org-admin" || r === "operator") return "org_admin";
  if (r === "driver") return "driver";
  return null;
}

export function isPlatformAdmin(role: string | undefined | null): boolean {
  return normalizeRole(role) === "saas_admin";
}

export function isOrgAdmin(role: string | undefined | null): boolean {
  return normalizeRole(role) === "org_admin";
}

/** Route after login by role. Legacy "admin" → platform. */
export function homePathForRole(role: string | undefined | null): string {
  const n = normalizeRole(role);
  switch (n) {
    case "saas_admin":
      return "/platform";
    case "org_admin":
      return "/org";
    case "driver":
      return "/driver";
    default:
      return "/driver";
  }
}

/** Longest-prefix match for protected routes. Public paths return true. */
export function canAccessPath(
  role: string | undefined | null,
  pathname: string,
): boolean {
  const rule = PROTECTED_ROUTES.filter(
    (r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`),
  ).sort((a, b) => b.prefix.length - a.prefix.length)[0];

  if (!rule) return true;

  const n = normalizeRole(role);
  if (!n) return false;
  return rule.roles.includes(n);
}

/** Primary header links visible for the current session. */
export function primaryNavLinks(role: string | undefined | null): NavLink[] {
  const n = normalizeRole(role);

  if (!n) {
    return [
      { href: "/search", label: "Find parking" },
      { href: "/pricing", label: "Pricing" },
      { href: "/how-it-works", label: "How it works" },
    ];
  }

  if (n === "saas_admin") {
    return [
      { href: "/platform", label: "Platform" },
      { href: "/platform/orgs", label: "Orgs" },
      { href: "/platform/observe", label: "Observe" },
      { href: "/platform/zones", label: "Zones" },
    ];
  }

  if (n === "org_admin") {
    return [
      { href: "/org", label: "Org" },
      { href: "/org/zones", label: "Zones" },
      { href: "/org/members", label: "Members" },
      { href: "/org/observe", label: "Observe" },
    ];
  }

  return [
    { href: "/driver", label: "Driver map" },
    { href: "/search", label: "Find parking" },
    { href: "/reservations", label: "Reservations" },
    { href: "/account", label: "Account" },
  ];
}

export function requiredRolesForPath(pathname: string): AppRole[] | null {
  const rule = PROTECTED_ROUTES.filter(
    (r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`),
  ).sort((a, b) => b.prefix.length - a.prefix.length)[0];
  return rule?.roles ?? null;
}
