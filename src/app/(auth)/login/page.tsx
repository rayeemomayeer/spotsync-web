"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/components/providers/AuthProvider";
import { PersonaSwitcher } from "@/components/demo/PersonaSwitcher";
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
          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          {loading ? (
            <p className="auth-card__sub" style={{ marginTop: "0.75rem", marginBottom: 0 }}>
              First request can take up to ~90s while free-tier API wakes. Leave this open.
            </p>
          ) : null}
          <p className="auth-card__sub" style={{ marginTop: "1rem", marginBottom: 0 }}>
            No account? <Link href="/signup">Create one</Link>
            {" · "}
            Demo console at <Link href="/console">/console</Link>
          </p>
          <PersonaSwitcher onDone={(role) => router.replace(homePathForRole(role))} />
        </form>
      </div>
    </div>
  );
}
