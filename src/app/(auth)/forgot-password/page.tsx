"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authClient } from "@/lib/auth/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : undefined;
      const result = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo,
      });
      if (result.error) {
        throw new Error(result.error.message ?? "Request failed");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <AppHeader showAuthCta={false} />
      <div className="auth-layout">
        <aside className="auth-layout__brand">
          <h2>Forgot password</h2>
          <p>Reset stays on the BFF Better Auth session path — same stack as Sign in.</p>
        </aside>
        <form className="auth-card" onSubmit={onSubmit}>
          <h1>Reset password</h1>
          <p className="auth-card__sub">
            We email a reset link via SpotSync notify when configured. Check spam if notify is
            on.
          </p>
          {done ? (
            <p className="status-ok">If that email exists, a reset link is on the way.</p>
          ) : (
            <>
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error ? <p className="auth-card__error">{error}</p> : null}
              <Button type="submit" variant="primary" fullWidth disabled={busy}>
                {busy ? "Sending…" : "Send reset link"}
              </Button>
            </>
          )}
          <p className="auth-card__sub auth-card__sub--foot">
            <Link href="/login">← Back to sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
