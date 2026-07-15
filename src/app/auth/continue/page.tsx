"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { parseAuthAudience } from "@/components/auth/AuthAudienceTabs";
import { postAuthPath } from "@/lib/auth/roles";

function safeNextPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

/**
 * Post-OAuth landing. Always redirects to role home (or ?next / org apply).
 * Retries getSession while free-tier BFF finishes waking from the Google hop.
 */
function ContinueInner() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const audience = parseAuthAudience(search.get("as"));
  const nextPath = safeNextPath(search.get("next"));
  const [status, setStatus] = useState("Waking API & finishing sign-in…");
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    let cancelled = false;

    async function settle() {
      const { warmBackend } = await import("@/lib/api/warm-backend");
      setStatus("Waking free-tier API…");
      await warmBackend().catch(() => undefined);
      // OAuth redirect can beat cookie persist / cold start — retry briefly.
      for (let i = 0; i < 10; i++) {
        if (cancelled) return;
        setStatus(i < 3 ? "Finishing sign-in…" : "Still waking API — leave this open…");
        await refresh();
        await new Promise((r) => setTimeout(r, 300 + i * 150));
      }
    }

    void settle();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useEffect(() => {
    if (loading || done.current) return;

    if (user) {
      done.current = true;
      setStatus("Redirecting…");
      router.replace(
        postAuthPath(user.role, {
          intent: audience,
          next: nextPath,
        }),
      );
      return;
    }

    const fail = window.setTimeout(() => {
      if (done.current) return;
      done.current = true;
      const q = new URLSearchParams();
      q.set("error", "session");
      if (audience === "organization") q.set("as", "org");
      if (nextPath) q.set("next", nextPath);
      router.replace(`/login?${q.toString()}`);
    }, 12_000);

    return () => window.clearTimeout(fail);
  }, [loading, user, audience, nextPath, router]);

  return (
    <div className="auth-page">
      <main className="auth-card" style={{ marginTop: "4rem" }}>
        <h1>Signing you in…</h1>
        <p className="auth-card__sub">{status}</p>
        <p className="auth-card__sub auth-card__sub--foot">
          Stuck? <Link href="/login">Back to sign in</Link>
        </p>
      </main>
    </div>
  );
}

export default function AuthContinuePage() {
  return (
    <Suspense
      fallback={
        <div className="auth-page">
          <p>Loading…</p>
        </div>
      }
    >
      <ContinueInner />
    </Suspense>
  );
}
