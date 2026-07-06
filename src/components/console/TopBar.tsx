"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { DEMO_CREDENTIALS } from "@/lib/api/client";
import type { SseStatus } from "@/lib/realtime/useZoneEvents";

function sseLabel(status: SseStatus): string {
  switch (status) {
    case "live":
      return "SSE live";
    case "connecting":
      return "SSE connecting";
    case "reconnecting":
      return "SSE reconnecting";
    default:
      return "SSE idle";
  }
}

export function TopBar({
  apiOnline,
  sseStatus,
  onSignIn,
}: {
  apiOnline: boolean;
  sseStatus: SseStatus;
  onSignIn: () => void;
}) {
  const { user, login, logout, demoSession } = useAuth();
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState("");

  async function demoLogin(creds: { email: string; password: string }) {
    setDemoLoading(true);
    setDemoError("");
    try {
      await login(creds.email, creds.password, true);
    } catch (e) {
      setDemoError(e instanceof Error ? e.message : "Demo login failed");
    } finally {
      setDemoLoading(false);
    }
  }

  const sseLive = sseStatus === "live";

  return (
    <header className="console-topbar">
      <div className="console-topbar__brand">
        <span className="console-topbar__logo">SpotSync</span>
        <span className="console-topbar__tag">Live Console</span>
        {demoSession && <span className="console-topbar__demo-badge">Demo session</span>}
      </div>

      <div className="console-topbar__status">
        <StatusDot ok={apiOnline} label={apiOnline ? "API online" : "API offline"} />
        <StatusDot ok={sseLive} label={sseLabel(sseStatus)} accent pulse={sseStatus === "reconnecting"} />
      </div>

      <div className="console-topbar__actions">
        {demoError && <span className="console-topbar__error">{demoError}</span>}
        {!user ? (
          <>
            <button
              type="button"
              className="console-btn console-btn--ghost"
              disabled={demoLoading}
              onClick={() => demoLogin(DEMO_CREDENTIALS.driver)}
            >
              {demoLoading ? "Signing in…" : "Demo Driver"}
            </button>
            <button
              type="button"
              className="console-btn console-btn--ghost"
              disabled={demoLoading}
              onClick={() => demoLogin(DEMO_CREDENTIALS.demoAdmin)}
            >
              Demo Admin
            </button>
            <button type="button" className="console-btn console-btn--primary" onClick={onSignIn}>
              Sign in
            </button>
          </>
        ) : (
          <div className="console-user-chip">
            <span className="console-user-chip__name">{user.name}</span>
            <span
              className={`console-user-chip__role ${user.role === "demo_admin" ? "console-user-chip__role--demo" : ""}`}
            >
              {user.role === "demo_admin" ? "demo admin · POST only" : user.role}
            </span>
            <button type="button" className="console-btn console-btn--text" onClick={logout}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function StatusDot({
  ok,
  label,
  accent,
  pulse,
}: {
  ok: boolean;
  label: string;
  accent?: boolean;
  pulse?: boolean;
}) {
  return (
    <span className="console-status-dot" title={label}>
      <span
        className={`console-status-dot__ping ${ok ? "console-status-dot__ping--on" : ""} ${accent ? "console-status-dot__ping--accent" : ""} ${pulse ? "console-status-dot__ping--pulse" : ""}`}
      />
      {label}
    </span>
  );
}
