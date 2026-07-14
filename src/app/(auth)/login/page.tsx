"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { AuthAudienceTabs, parseAuthAudience } from "@/components/auth/AuthAudienceTabs";
import { AuthColdStartStatus, useAuthColdStart } from "@/components/auth/AuthColdStart";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/components/providers/AuthProvider";
import { PersonaSwitcher } from "@/components/demo/PersonaSwitcher";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { postAuthPath } from "@/lib/auth/roles";

function safeNextPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function LoginInner() {
  const { loginWithSession } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const audience = parseAuthAudience(search.get("as"));
  const isOrg = audience === "organization";
  const nextPath = safeNextPath(search.get("next"));
  const { phase, setPhase, ensureReady, mapError } = useAuthColdStart();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() =>
    search.get("error") === "google"
      ? "Google sign-in failed. Try again or use email."
      : search.get("error") === "session"
        ? "Signed in with Google but session did not stick. Try again."
        : "",
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await ensureReady();
      setPhase("signing");
      const { role } = await loginWithSession(email, password);
      router.replace(
        postAuthPath(role, {
          intent: audience,
          next: nextPath,
        }),
      );
    } catch (err) {
      setError(mapError(err));
      setPhase("degraded");
    } finally {
      setLoading(false);
    }
  }

  const signupHref = isOrg
    ? `/signup?as=org${nextPath ? `&next=${encodeURIComponent(nextPath)}` : ""}`
    : nextPath
      ? `/signup?next=${encodeURIComponent(nextPath)}`
      : "/signup";

  return (
    <div className="auth-page">
      <AppHeader showAuthCta={false} />
      <div className="auth-layout">
        <aside className="auth-layout__brand">
          <h2>SpotSync</h2>
          {isOrg ? (
            <p>
              Organization sign-in for garage operators. After platform approval and a Starter/Growth
              plan, manage zones and spots from your org dashboard.
            </p>
          ) : (
            <p>Sign in to book spots, manage reservations, or switch to Organization for garage tools.</p>
          )}
        </aside>
        <form className="auth-card" onSubmit={onSubmit}>
          <AuthAudienceTabs value={audience} basePath="/login" nextPath={nextPath} />
          <h1>{isOrg ? "Organization sign in" : "Sign in"}</h1>
          <p className="auth-card__sub">
            {isOrg
              ? "Use your org account. New operators: create an account, then apply — approval unlocks billing, then zone publish."
              : "Driver account via SpotSync BFF."}
          </p>
          {isOrg ? (
            <ol className="auth-org-steps">
              <li>Sign in or create an organization account</li>
              <li>Submit garage application (pending)</li>
              <li>Platform admin approves</li>
              <li>Subscribe (Starter/Growth) → create zones &amp; spots</li>
            </ol>
          ) : null}
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
            {loading
              ? phase === "signing"
                ? "Signing in…"
                : "Waking API…"
              : isOrg
                ? "Sign in as organization"
                : "Sign in"}
          </Button>
          <GoogleAuthButton audience={audience} nextPath={nextPath} />
          <p className="auth-card__sub auth-card__sub--foot">
            {isOrg ? (
              <>
                New garage? <Link href={signupHref}>Create organization account</Link>
                {" · "}
                <Link href="/apply">Already signed in? Apply</Link>
              </>
            ) : (
              <>
                No account? <Link href={signupHref}>Create one</Link>
                {" · "}
                <Link href="/forgot-password">Forgot password</Link>
                {" · "}
                <Link href="/login?as=org">Organization sign in</Link>
              </>
            )}
          </p>
          <PersonaSwitcher
            onDone={(role) =>
              router.replace(postAuthPath(role, { intent: audience, next: nextPath }))
            }
          />
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-page">
          <p>Loading…</p>
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
