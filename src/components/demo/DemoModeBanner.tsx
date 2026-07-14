"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getBffUrl } from "@/lib/auth/client";
import {
  getDemoSessionId,
  isDemoSession,
  setDemoSession,
} from "@/lib/auth/session";

/** Marketing / public pages — no demo chrome. */
const HIDDEN_PREFIXES = [
  "/",
  "/pricing",
  "/how-it-works",
  "/developers",
  "/legal",
  "/login",
  "/signup",
];

function shouldShowBanner(pathname: string): boolean {
  if (pathname === "/") return false;
  return !HIDDEN_PREFIXES.some(
    (p) => p !== "/" && (pathname === p || pathname.startsWith(`${p}/`)),
  );
}

export function DemoModeBanner() {
  const pathname = usePathname() ?? "/";
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setOn(isDemoSession());
  }, []);

  const toggle = useCallback(() => {
    const next = !on;
    setDemoSession(next);
    setOn(next);
    setMsg("");
  }, [on]);

  async function resetSandbox() {
    const sid = getDemoSessionId();
    if (!sid) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`${getBffUrl()}/api/demo/reset`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Demo-Mode": "true",
          "X-Demo-Session-Id": sid,
        },
        body: JSON.stringify({}),
      });
      const json = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(json.message ?? "Reset failed");
      setMsg("Sandbox reset");
      window.location.reload();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  }

  if (!shouldShowBanner(pathname)) return null;

  return (
    <div className={`demo-bar${on ? " demo-bar--on" : ""}`} role="region" aria-label="Demo mode">
      <div className="demo-bar__inner">
        <label className="demo-bar__toggle">
          <input
            type="checkbox"
            className="demo-bar__checkbox"
            checked={on}
            onChange={toggle}
          />
          <span className="demo-bar__label">
            <span className="demo-bar__title">Demo mode</span>
            <span className="demo-bar__hint">Isolated sandbox on live stack</span>
          </span>
        </label>

        <div className="demo-bar__actions">
          {msg ? <span className="demo-bar__msg">{msg}</span> : null}
          {on ? (
            <button
              type="button"
              className="demo-bar__btn"
              disabled={busy}
              onClick={() => void resetSandbox()}
            >
              {busy ? "Resetting…" : "Reset sandbox"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
