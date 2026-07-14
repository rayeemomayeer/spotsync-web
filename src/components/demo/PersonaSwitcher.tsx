"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { DEMO_CREDENTIALS } from "@/lib/api/client";
import { toAuthUserMessage } from "@/lib/api/fetch-retry";
import { warmBackend } from "@/lib/api/warm-backend";

const personas = [
  {
    id: "driver",
    label: "Driver",
    email: DEMO_CREDENTIALS.driver.email,
    password: DEMO_CREDENTIALS.driver.password,
  },
  {
    id: "org_admin",
    label: "Org admin",
    email: DEMO_CREDENTIALS.demoAdmin.email,
    password: DEMO_CREDENTIALS.demoAdmin.password,
  },
  {
    id: "saas_admin",
    label: "Platform admin",
    email: DEMO_CREDENTIALS.admin.email,
    password: DEMO_CREDENTIALS.admin.password,
  },
] as const;

export function PersonaSwitcher({ onDone }: { onDone?: (role?: string) => void }) {
  const { loginWithSession, login } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function switchPersona(id: string, email: string, password: string) {
    if (!email || !password) {
      setError("Missing credentials for selected persona");
      return;
    }
    setBusy(id);
    setError("");
    try {
      await warmBackend().catch(() => undefined);
      try {
        const { role } = await loginWithSession(email, password);
        onDone?.(role);
        return;
      } catch (sessionErr) {
        // Better Auth may lack this user; fall back to Go JWT (seeded saas_admin).
        if (id !== "saas_admin") throw sessionErr;
        await login(email, password, true);
        onDone?.("saas_admin");
      }
    } catch (e) {
      setError(toAuthUserMessage(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="persona-switcher">
      <p className="persona-switcher__label">Quick login (demo personas)</p>
      <div className="persona-switcher__row">
        {personas.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`console-btn console-btn--ghost${p.id === "saas_admin" ? " persona-switcher__platform" : ""}`}
            disabled={busy != null}
            onClick={() => void switchPersona(p.id, p.email, p.password)}
          >
            {busy === p.id ? "…" : p.label}
          </button>
        ))}
      </div>
      <p className="persona-switcher__hint">
        Platform: <code>{DEMO_CREDENTIALS.admin.email}</code>
        {process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD
          ? " (password from env)"
          : " · default demo password AdminPass123!"}
      </p>
      {error ? <p className="auth-card__error">{error}</p> : null}
    </div>
  );
}
