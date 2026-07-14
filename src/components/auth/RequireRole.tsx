"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  canAccessPath,
  homePathForRole,
  normalizeRole,
  requiredRolesForPath,
  type AppRole,
} from "@/lib/auth/roles";

type Props = {
  children: React.ReactNode;
  /** Override path for policy lookup (defaults to current pathname). */
  path?: string;
  /** Explicit allow-list — when set, ignores path policy. */
  roles?: AppRole[];
};

/**
 * Client gate for role-protected surfaces.
 * Session cookies live on the BFF origin, so edge middleware cannot enforce this.
 */
export function RequireRole({ children, path, roles }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const checkPath = path ?? pathname;

  const userRole = normalizeRole(user?.role);
  const ok = (() => {
    if (!userRole) return false;
    if (roles?.length) {
      return roles.some((r) => normalizeRole(r) === userRole);
    }
    return canAccessPath(userRole, checkPath);
  })();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(checkPath)}`);
      return;
    }
    if (!ok) {
      router.replace(homePathForRole(user.role));
    }
  }, [loading, user, ok, router, checkPath]);

  if (loading) {
    return (
      <div className="role-gate">
        <p>Checking access…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="role-gate">
        <p>
          Sign in required.{" "}
          <Link href={`/login?next=${encodeURIComponent(checkPath)}`}>Sign in</Link>
        </p>
      </div>
    );
  }

  if (!ok) {
    const need = roles ?? requiredRolesForPath(checkPath);
    return (
      <div className="role-gate">
        <p>
          Role gate: need {need?.join(" or ") ?? "access"}. Your role: <code>{user.role}</code>
        </p>
        <p>
          <Link href={homePathForRole(user.role)}>Go to your home</Link>
        </p>
      </div>
    );
  }

  return children;
}
