"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DemoModeBanner } from "@/components/demo/DemoModeBanner";
import { isFeatureEnabled } from "@/lib/config/flags";
import { getDemoSessionId, isDemoSession, setDemoSession } from "@/lib/auth/session";

type DemoModeContextValue = {
  enabled: boolean;
  sessionId: string | null;
  setEnabled: (value: boolean) => void;
};

const DemoModeContext = createContext<DemoModeContextValue | null>(null);

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const showBanner =
    isFeatureEnabled("demo_console") || isFeatureEnabled("demo_mode");

  useEffect(() => {
    setEnabledState(isDemoSession());
    setSessionId(getDemoSessionId());
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    setDemoSession(value);
    setEnabledState(value);
    setSessionId(getDemoSessionId());
  }, []);

  const value = useMemo(
    () => ({ enabled, sessionId, setEnabled }),
    [enabled, sessionId, setEnabled],
  );

  return (
    <DemoModeContext.Provider value={value}>
      {showBanner ? <DemoModeBanner /> : null}
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const ctx = useContext(DemoModeContext);
  if (!ctx) {
    return {
      enabled: isDemoSession(),
      sessionId: getDemoSessionId(),
      setEnabled: setDemoSession,
    };
  }
  return ctx;
}
