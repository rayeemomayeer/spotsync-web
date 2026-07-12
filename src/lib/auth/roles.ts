export type AppRole = "saas_admin" | "org_admin" | "driver" | "admin";

export function normalizeRole(role: string | undefined | null): AppRole | null {
  if (!role) return null;
  const r = role.toLowerCase().trim();
  if (r === "admin" || r === "saas_admin" || r === "platform_admin") return "saas_admin";
  if (r === "org_admin" || r === "org-admin" || r === "operator") return "org_admin";
  if (r === "driver") return "driver";
  return null;
}

export function isPlatformAdmin(role: string | undefined | null): boolean {
  const n = normalizeRole(role);
  return n === "saas_admin";
}

export function isOrgAdmin(role: string | undefined | null): boolean {
  const n = normalizeRole(role);
  return n === "org_admin";
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
