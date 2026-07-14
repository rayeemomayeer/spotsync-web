"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authClient } from "@/lib/auth/client";

function ResetInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("Missing reset token. Open the link from your email.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (result.error) {
        throw new Error(result.error.message ?? "Reset failed");
      }
      router.replace("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth-card" onSubmit={onSubmit}>
      <h1>Choose a new password</h1>
      <p className="auth-card__sub">Token from your email link. Minimum 8 characters.</p>
      {!token ? (
        <p className="auth-card__error">Missing token — request a new reset link.</p>
      ) : null}
      <label htmlFor="password">New password</label>
      <Input
        id="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error ? <p className="auth-card__error">{error}</p> : null}
      <Button type="submit" variant="primary" fullWidth disabled={busy || !token}>
        {busy ? "Saving…" : "Update password"}
      </Button>
      <p className="auth-card__sub auth-card__sub--foot">
        <Link href="/forgot-password">Request another link</Link> · <Link href="/login">Sign in</Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="auth-page">
      <AppHeader showAuthCta={false} />
      <div className="auth-layout">
        <aside className="auth-layout__brand">
          <h2>New password</h2>
          <p>Complete the reset flow that started from your email.</p>
        </aside>
        <Suspense fallback={<p className="auth-card">Loading…</p>}>
          <ResetInner />
        </Suspense>
      </div>
    </div>
  );
}
