"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { AuthColdStartStatus, useAuthColdStart } from "@/components/auth/AuthColdStart";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/components/providers/AuthProvider";
import { homePathForRole } from "@/lib/auth/roles";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

function safeNextPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function SignupInner() {
  const { signupWithSession } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const nextPath = safeNextPath(search.get("next"));
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
      router.replace(nextPath ?? homePathForRole(role));
    } catch (err) {
      setError(mapError(err));
      setPhase("degraded");
    } finally {
      setLoading(false);
    }
  }

  const loginHref = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";

  return (
    <div className="auth-page">
      <AppHeader showAuthCta={false} />
      <div className="auth-layout">
        <aside className="auth-layout__brand">
          <h2>Join SpotSync</h2>
          <p>
            Create an account to book parking — or apply as a garage operator after signup.
          </p>
        </aside>
        <form className="auth-card" onSubmit={onSubmit}>
          <h1>Create account</h1>
          <p className="auth-card__sub">
            Signup creates a driver account. Operators apply at{" "}
            <Link href="/apply">/apply</Link> for platform approval.
          </p>
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
            Already have an account? <Link href={loginHref}>Sign in</Link>
            {" · "}
            <Link href="/apply">Operate a garage</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-page">
          <p>Loading…</p>
        </div>
      }
    >
      <SignupInner />
    </Suspense>
  );
}
