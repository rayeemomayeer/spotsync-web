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
import { postAuthPath } from "@/lib/auth/roles";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

function safeNextPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function SignupInner() {
  const { signupWithSession } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const audience = parseAuthAudience(search.get("as"));
  const isOrg = audience === "organization";
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
      // Org intent always continues to apply (new accounts are drivers until apply).
      router.replace(
        postAuthPath(role, {
          intent: audience,
          next: isOrg ? nextPath ?? "/apply" : nextPath,
        }),
      );
    } catch (err) {
      setError(mapError(err));
      setPhase("degraded");
    } finally {
      setLoading(false);
    }
  }

  const loginHref = isOrg
    ? `/login?as=org${nextPath ? `&next=${encodeURIComponent(nextPath)}` : ""}`
    : nextPath
      ? `/login?next=${encodeURIComponent(nextPath)}`
      : "/login";

  return (
    <div className="auth-page">
      <AppHeader showAuthCta={false} />
      <div className="auth-layout">
        <aside className="auth-layout__brand">
          <h2>{isOrg ? "Garage operators" : "Join SpotSync"}</h2>
          {isOrg ? (
            <p>
              Create an organization account, apply for your garage, get approved, subscribe, then
              publish zones and spots.
            </p>
          ) : (
            <p>Create an account to book parking — or switch to Organization for garage tools.</p>
          )}
        </aside>
        <form className="auth-card" onSubmit={onSubmit}>
          <AuthAudienceTabs value={audience} basePath="/signup" nextPath={nextPath} />
          <h1>{isOrg ? "Create organization account" : "Create account"}</h1>
          <p className="auth-card__sub">
            {isOrg
              ? "Starts as a normal user, then you submit a garage application. Zones unlock after approval + plan."
              : "Driver signup via SpotSync BFF."}
          </p>
          {isOrg ? (
            <ol className="auth-org-steps">
              <li>Create this account</li>
              <li>Name your garage on the next screen</li>
              <li>Wait for platform approval</li>
              <li>Pay (Starter/Growth) → create zones &amp; spots</li>
            </ol>
          ) : null}
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
            {loading
              ? phase === "signing"
                ? "Creating…"
                : "Waking API…"
              : isOrg
                ? "Continue to garage application"
                : "Create account"}
          </Button>
          <GoogleAuthButton
            label={isOrg ? "Continue with Google" : "Sign up with Google"}
            audience={audience}
            nextPath={isOrg ? nextPath ?? "/apply" : nextPath}
          />
          <p className="auth-card__sub auth-card__sub--foot">
            Already have an account?{" "}
            <Link href={loginHref}>{isOrg ? "Organization sign in" : "Sign in"}</Link>
            {!isOrg ? (
              <>
                {" · "}
                <Link href="/signup?as=org">Organization signup</Link>
              </>
            ) : null}
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
