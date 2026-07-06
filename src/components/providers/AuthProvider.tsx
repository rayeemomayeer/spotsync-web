"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api/client";
import type { User } from "@/lib/api/types";
import { clearSession, getCachedUser, getToken, isDemoSession, setCachedUser, setDemoSession, setToken } from "@/lib/auth/session";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  demoSession: boolean;
  login: (email: string, password: string, demo?: boolean) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoSession, setDemoSessionState] = useState(false);

  const refresh = useCallback(async () => {
    const t = getToken();
    setTokenState(t);
    setDemoSessionState(isDemoSession());
    if (!t) {
      setUser(null);
      return;
    }
    const cached = getCachedUser<User>();
    try {
      const me = await api.me(t);
      setUser(me);
      setCachedUser(me);
    } catch {
      if (cached) {
        setUser(cached);
        return;
      }
      clearSession();
      setUser(null);
      setTokenState(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await refresh();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const login = useCallback(async (email: string, password: string, demo = false) => {
    const data = await api.login(email, password);
    setToken(data.token);
    setDemoSession(demo);
    setTokenState(data.token);
    setDemoSessionState(demo);
    setUser(data.user);
    setCachedUser(data.user);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setTokenState(null);
    setDemoSessionState(false);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, demoSession, login, logout, refresh }),
    [user, token, loading, demoSession, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
