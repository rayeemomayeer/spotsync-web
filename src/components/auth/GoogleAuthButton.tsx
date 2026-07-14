"use client";

import { useState } from "react";
import { authClient, getBffUrl } from "@/lib/auth/client";
import { isFeatureEnabled } from "@/lib/config/flags";
import { Button } from "@/components/ui/Button";

/** Google OAuth via BFF Better Auth. Hidden unless `google_oauth` feature flag. */
export function GoogleAuthButton({ label = "Continue with Google" }: { label?: string }) {
  const enabled = isFeatureEnabled("google_oauth");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!enabled) return null;

  async function onClick() {
    setBusy(true);
    setError("");
    try {
      const callbackURL =
        typeof window !== "undefined" ? `${window.location.origin}/` : getBffUrl();
      await authClient.signIn.social({
        provider: "google",
        callbackURL,
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
