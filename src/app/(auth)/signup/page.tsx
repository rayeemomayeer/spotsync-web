"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { AuthColdStartStatus, useAuthColdStart } from "@/components/auth/AuthColdStart";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/components/providers/AuthProvider";
import { homePathForRole } from "@/lib/auth/roles";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

export default function SignupPage() {
  const { signupWithSession } = useAuth();
  const router = useRouter();
  const { phase, setPhase, ensureReady, mapError } = useAuthColdStart();
  const [name, setName] = useState("");
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
      const { role } = await signupWithSession({ name, email, password });
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
          <h2>Join SpotSync</h2>
          <p>Create a driver account to search live capacity and pay before you reserve.</p>
        </aside>
        <form className="auth-card" onSubmit={onSubmit}>
          <h1>Create account</h1>
          <p className="auth-card__sub">Driver signup via SpotSync BFF. Org and platform roles are seeded.</p>
          <label htmlFor="name">Name</label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error ? <p className="auth-card__error">{error}</p> : null}
          <AuthColdStartStatus phase={loading ? (phase === "signing" ? "signing" : "warming") : phase} />
          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? (phase === "signing" ? "Creating…" : "Waking API…") : "Create account"}
          </Button>
          <GoogleAuthButton label="Sign up with Google" />
          <p className="auth-card__sub auth-card__sub--foot">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
