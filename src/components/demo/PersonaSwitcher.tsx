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
    email: "admin@spotsync.com",
    password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD ?? "",
  },
] as const;

export function PersonaSwitcher({ onDone }: { onDone?: (role?: string) => void }) {
  const { loginWithSession } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function switchPersona(id: string, email: string, password: string) {
    if (!password) {
      setError("Missing password for selected persona");
      return;
    }
    setBusy(id);
    setError("");
    try {
      await warmBackend().catch(() => undefined);
      const { role } = await loginWithSession(email, password);
      onDone?.(role);
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
            className="console-btn console-btn--ghost"
            disabled={busy != null || !p.password}
            onClick={() => void switchPersona(p.id, p.email, p.password)}
          >
            {busy === p.id ? "…" : p.label}
          </button>
        ))}
      </div>
      {error ? <p className="auth-card__error">{error}</p> : null}
    </div>
  );
}
