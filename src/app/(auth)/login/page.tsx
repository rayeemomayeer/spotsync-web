"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/components/providers/AuthProvider";
import { homePathForRole } from "@/lib/auth/roles";

export default function LoginPage() {
  const { loginWithSession } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { role } = await loginWithSession(email, password);
      router.replace(homePathForRole(role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <AppHeader showAuthCta={false} />
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Sign in</h1>
        <p className="auth-card__sub">Email and password via SpotSync BFF.</p>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <p className="auth-card__error">{error}</p> : null}
        <button type="submit" className="console-btn console-btn--primary console-btn--full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <p className="auth-card__sub" style={{ marginTop: "1rem", marginBottom: 0 }}>
          Demo console still at <Link href="/console">/console</Link>
        </p>
      </form>
    </div>
  );
}
