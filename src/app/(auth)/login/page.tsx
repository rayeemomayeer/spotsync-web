"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { AuthColdStartStatus, useAuthColdStart } from "@/components/auth/AuthColdStart";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/components/providers/AuthProvider";
import { PersonaSwitcher } from "@/components/demo/PersonaSwitcher";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { homePathForRole } from "@/lib/auth/roles";

export default function LoginPage() {
  const { loginWithSession } = useAuth();
  const router = useRouter();
  const { phase, setPhase, ensureReady, mapError } = useAuthColdStart();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await ensureReady();
      setPhase("signing");
      const { role } = await loginWithSession(email, password);
      router.replace(homePathForRole(role));
    } catch (err) {
      setError(mapError(err));
      setPhase("degraded");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <AppHeader showAuthCta={false} />
      <div className="auth-layout">
        <aside className="auth-layout__brand">
          <h2>SpotSync</h2>
          <p>Sign in to book spots, manage reservations, or operate your garage inventory.</p>
        </aside>
        <form className="auth-card" onSubmit={onSubmit}>
          <h1>Sign in</h1>
          <p className="auth-card__sub">Email and password via SpotSync BFF.</p>
          <label htmlFor="email">Email</label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="password">Password</label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error ? <p className="auth-card__error">{error}</p> : null}
          <AuthColdStartStatus phase={loading ? (phase === "signing" ? "signing" : "warming") : phase} />
          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? (phase === "signing" ? "Signing in…" : "Waking API…") : "Sign in"}
          </Button>
          <GoogleAuthButton />
          <p className="auth-card__sub auth-card__sub--foot">
            No account? <Link href="/signup">Create one</Link>
            {" · "}
            <Link href="/forgot-password">Forgot password</Link>
            {" · "}
            Demo console at <Link href="/console">/console</Link>
          </p>
          <PersonaSwitcher onDone={(role) => router.replace(homePathForRole(role))} />
        </form>
      </div>
    </div>
  );
}
