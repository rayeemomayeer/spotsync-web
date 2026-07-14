"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { isFeatureEnabled } from "@/lib/config/flags";
import { Button } from "@/components/ui/Button";
import type { AuthAudience } from "@/components/auth/AuthAudienceTabs";

type Props = {
  label?: string;
  /** Preserve org vs driver intent across Google redirect. */
  audience?: AuthAudience;
  /** Absolute path only, e.g. /apply */
  nextPath?: string | null;
};

function buildContinueUrl(audience: AuthAudience, nextPath?: string | null): string {
  const origin = window.location.origin;
  const q = new URLSearchParams();
  if (audience === "organization") q.set("as", "org");
  if (nextPath) q.set("next", nextPath);
  const qs = q.toString();
  return `${origin}/auth/continue${qs ? `?${qs}` : ""}`;
}

function buildErrorUrl(audience: AuthAudience, nextPath?: string | null): string {
  const origin = window.location.origin;
  const q = new URLSearchParams();
  q.set("error", "google");
  if (audience === "organization") q.set("as", "org");
  if (nextPath) q.set("next", nextPath);
  return `${origin}/login?${q.toString()}`;
}

/** Google OAuth via BFF Better Auth. Hidden unless `google_oauth` feature flag. */
export function GoogleAuthButton({
  label = "Continue with Google",
  audience = "driver",
  nextPath = null,
}: Props) {
  const enabled = isFeatureEnabled("google_oauth");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!enabled) return null;

  async function onClick() {
    setBusy(true);
    setError("");
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: buildContinueUrl(audience, nextPath),
        errorCallbackURL: buildErrorUrl(audience, nextPath),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Google sign-in failed");
      setBusy(false);
    }
  }

  return (
    <div className="auth-social">
      <Button type="button" variant="ghost" fullWidth disabled={busy} onClick={() => void onClick()}>
        {busy ? "Redirecting…" : label}
      </Button>
      {error ? <p className="auth-card__error">{error}</p> : null}
    </div>
  );
}
