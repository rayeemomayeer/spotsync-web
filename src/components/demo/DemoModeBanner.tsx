"use client";

import { useCallback, useEffect, useState } from "react";
import { getBffUrl } from "@/lib/auth/client";
import {
  getDemoSessionId,
  isDemoSession,
  setDemoSession,
} from "@/lib/auth/session";

export function DemoModeBanner() {
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
      const json = (await res.json()) as { message?: string; data?: unknown };
      if (!res.ok) throw new Error(json.message ?? "Reset failed");
      setMsg("Sandbox reset");
      window.location.reload();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="shell-card"
      style={{
        marginBottom: "0.75rem",
        padding: "0.65rem 0.85rem",
        display: "flex",
        gap: "0.75rem",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <label style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
        <input type="checkbox" checked={on} onChange={toggle} />
        Demo mode (real stack, isolated session)
      </label>
      {on ? (
        <button
          type="button"
          className="console-btn console-btn--ghost"
          disabled={busy}
          onClick={() => void resetSandbox()}
        >
          {busy ? "Resetting…" : "Reset sandbox"}
        </button>
      ) : null}
      {msg ? <span style={{ fontSize: "0.85rem" }}>{msg}</span> : null}
    </div>
  );
}
