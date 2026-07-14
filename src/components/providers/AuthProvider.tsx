"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import type { User } from "@/lib/api/types";
import { registerUnauthorizedHandler } from "@/lib/api/unauthorized";
import { toAuthUserMessage } from "@/lib/api/fetch-retry";
import { authClient } from "@/lib/auth/client";
import { clearSession, getCachedUser, getToken, isDemoSession, setCachedUser, setDemoSession, setToken } from "@/lib/auth/session";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  demoSession: boolean;
  /** JWT path — console demo / legacy API login */
  login: (email: string, password: string, demo?: boolean) => Promise<void>;
  /** better-auth session path — BFF login */
  loginWithSession: (email: string, password: string) => Promise<{ role?: string }>;
  /** better-auth signup — BFF creates driver + Go bridge user */
  signupWithSession: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<{ role?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function sessionUserToAppUser(sessionUser: {
  id: string;
  name: string;
  email: string;
  role?: string;
}): User {
  const role = (sessionUser.role ?? "driver") as User["role"];
  return {
    id: Number(sessionUser.id) || 0,
    name: sessionUser.name,
    email: sessionUser.email,
    role,
    created_at: "",
    updated_at: "",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoSession, setDemoSessionState] = useState(false);

  const refresh = useCallback(async () => {
    const t = getToken();
    setTokenState(t);
    setDemoSessionState(isDemoSession());

    if (t) {
      const cached = getCachedUser<User>();
      try {
        const me = await api.me(t);
        setUser(me);
        setCachedUser(me);
        return;
      } catch {
        if (cached) {
          setUser(cached);
          return;
        }
        clearSession();
        setTokenState(null);
      }
    }

    try {
      const { data } = await authClient.getSession();
      if (data?.user) {
        const mapped = sessionUserToAppUser(data.user as Parameters<typeof sessionUserToAppUser>[0]);
        setUser(mapped);
        setCachedUser(mapped);
        return;
      }
    } catch {
      /* BFF may be down — keep JWT/demo path usable */
    }

    setUser(null);
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      clearSession();
      setUser(null);
      setTokenState(null);
      setDemoSessionState(false);
      router.replace("/login");
    });
  }, [router]);

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

  const loginWithSession = useCallback(async (email: string, password: string) => {
    let result: Awaited<ReturnType<typeof authClient.signIn.email>>;
    try {
      result = await authClient.signIn.email({ email, password });
    } catch (err) {
      throw new Error(toAuthUserMessage(err));
    }
    if (result.error) {
      throw new Error(toAuthUserMessage(new Error(result.error.message ?? "Sign in failed")));
    }
    const sessionUser = result.data?.user as { role?: string; id: string; name: string; email: string } | undefined;
    if (sessionUser) {
      const mapped = sessionUserToAppUser(sessionUser);
      setUser(mapped);
      setCachedUser(mapped);
      setTokenState(null);
      setDemoSession(false);
      setDemoSessionState(false);
      return { role: mapped.role };
    }
    await refresh();
    const cached = getCachedUser<User>();
    return { role: cached?.role };
  }, [refresh]);

  const signupWithSession = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      let result: Awaited<ReturnType<typeof authClient.signUp.email>>;
      try {
        result = await authClient.signUp.email({
          name: input.name,
          email: input.email,
          password: input.password,
        });
      } catch (err) {
        throw new Error(toAuthUserMessage(err));
      }
      if (result.error) {
        throw new Error(toAuthUserMessage(new Error(result.error.message ?? "Sign up failed")));
      }
      const sessionUser = result.data?.user as
        | { role?: string; id: string; name: string; email: string }
        | undefined;
      if (sessionUser) {
        const mapped = sessionUserToAppUser(sessionUser);
        setUser(mapped);
        setCachedUser(mapped);
        setTokenState(null);
        setDemoSession(false);
        setDemoSessionState(false);
        return { role: mapped.role };
      }
      await refresh();
      const cached = getCachedUser<User>();
      return { role: cached?.role };
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    clearSession();
    setUser(null);
    setTokenState(null);
    setDemoSessionState(false);
    try {
      await authClient.signOut();
    } catch {
      /* ignore — JWT-only sessions have no BFF cookie */
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      demoSession,
      login,
      loginWithSession,
      signupWithSession,
      logout,
      refresh,
    }),
    [user, token, loading, demoSession, login, loginWithSession, signupWithSession, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
