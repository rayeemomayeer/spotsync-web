"use client";

import Link from "next/link";

export type AuthAudience = "driver" | "organization";

type Props = {
  value: AuthAudience;
  /** Base path without query, e.g. /login or /signup */
  basePath: "/login" | "/signup";
  /** Preserve next= when switching tabs */
  nextPath?: string | null;
};

function hrefFor(base: "/login" | "/signup", as: AuthAudience, next?: string | null): string {
  const q = new URLSearchParams();
  if (as === "organization") q.set("as", "org");
  if (next) q.set("next", next);
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}

/** Driver vs Organization account intent on auth screens. */
export function AuthAudienceTabs({ value, basePath, nextPath }: Props) {
  return (
    <div className="auth-audience" role="tablist" aria-label="Account type">
      <Link
        href={hrefFor(basePath, "driver", nextPath)}
        role="tab"
        aria-selected={value === "driver"}
        className={`auth-audience__tab${value === "driver" ? " auth-audience__tab--active" : ""}`}
      >
        Driver
      </Link>
      <Link
        href={hrefFor(basePath, "organization", nextPath)}
        role="tab"
        aria-selected={value === "organization"}
        className={`auth-audience__tab${value === "organization" ? " auth-audience__tab--active" : ""}`}
      >
        Organization
      </Link>
    </div>
  );
}

export function parseAuthAudience(raw: string | null): AuthAudience {
  if (raw === "org" || raw === "organization" || raw === "operator") return "organization";
  return "driver";
}
