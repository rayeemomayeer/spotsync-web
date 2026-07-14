"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DemoLoginButtons } from "@/components/demo/DemoLoginButtons";
import { useAuth } from "@/components/providers/AuthProvider";
import { DEMO_CREDENTIALS } from "@/lib/api/client";
import { isDemoModeEnabled } from "@/lib/config/demo";

export function AuthSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const showDemo = isDemoModeEnabled();

  async function handleLogin(demo = false, creds?: { email: string; password: string }) {
    setLoading(true);
    setError("");
    try {
      await login(creds?.email ?? email, creds?.password ?? password, demo);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h2 className="mb-4 text-xl font-semibold text-[#2D2A26]">Sign in to reserve</h2>
        {showDemo ? (
          <>
            <DemoLoginButtons
              loading={loading}
              onDriver={() => handleLogin(true, DEMO_CREDENTIALS.driver)}
              onDemoAdmin={() => handleLogin(true, DEMO_CREDENTIALS.demoAdmin)}
              onAdmin={() => handleLogin(true, DEMO_CREDENTIALS.admin)}
            />
            <div className="my-4 flex items-center gap-2 text-xs text-[#999]">
              <span className="h-px flex-1 bg-[#eee]" />
              or
              <span className="h-px flex-1 bg-[#eee]" />
            </div>
          </>
        ) : null}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-2 w-full rounded-lg border border-[#eee] px-3 py-2 text-sm"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3 w-full rounded-lg border border-[#eee] px-3 py-2 text-sm"
        />
        {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
        <button
          type="button"
          disabled={loading}
          onClick={() => handleLogin(false)}
          className="w-full rounded-full bg-[#2D2A26] py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          Sign in
        </button>
        <button type="button" onClick={onClose} className="mt-3 w-full text-sm text-[#888]">
          Cancel
        </button>
      </motion.div>
    </div>
  );
}
