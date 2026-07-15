"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import type { User } from "@/lib/api/types";
import { registerUnauthorizedHandler } from "@/lib/api/unauthorized";
import { toAuthUserMessage } from "@/lib/api/fetch-retry";
import { authClient } from "@/lib/auth/client";
import { fetchGoBridgeToken } from "@/lib/auth/go-bridge";
import {
  clearSession,
  clearToken,
  getCachedUser,
  getToken,
  isDemoSession,
  setCachedUser,
  setDemoSession,
  setToken,
} from "@/lib/auth/session";
import { toast } from "@/lib/toast";

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

async function hydrateGoBridgeToken(creds?: {
  email: string;
  password: string;
}): Promise<string | null> {
  // Password exchange does not need cookies — one attempt is enough.
  if (creds?.email && creds.password) {
    const bridge = await fetchGoBridgeToken(creds);
    if (bridge) {
      setToken(bridge);
      return bridge;
    }
  }
  for (let i = 0; i < 5; i++) {
    const bridge = await fetchGoBridgeToken();
    if (bridge) {
      setToken(bridge);
      return bridge;
    }
    await new Promise((r) => setTimeout(r, 150 + i * 120));
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoSession, setDemoSessionState] = useState(false);
  const recovering401 = useRef(false);

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
        // Stale JWT — drop it and try Better Auth cookie session instead.
        clearToken();
        setTokenState(null);
        if (cached && isDemoSession()) {
          setUser(cached);
          return;
        }
      }
    }

    try {
      const { data } = await authClient.getSession();
      if (data?.user) {
        const mapped = sessionUserToAppUser(data.user as Parameters<typeof sessionUserToAppUser>[0]);
        setUser(mapped);
        setCachedUser(mapped);
        const bridge = await hydrateGoBridgeToken();
        setTokenState(bridge);
        return;
      }
    } catch {
      /* BFF may be down — keep JWT/demo path usable */
    }

    setUser(null);
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(({ hadBearer }) => {
      void (async () => {
        // Cookie-only call failed — do not wipe a Better Auth UI session.
        // Driver map used to fire my-reservations with "" token and bounce to /login.
        if (!hadBearer) return;

        if (recovering401.current) return;
        recovering401.current = true;
        try {
          const bridge = await hydrateGoBridgeToken();
          if (bridge) {
            setTokenState(bridge);
            return;
          }
        } catch {
          /* fall through to logout */
        } finally {
          recovering401.current = false;
        }

        clearSession();
        setUser(null);
        setTokenState(null);
        setDemoSessionState(false);
        try {
          await authClient.signOut();
        } catch {
          /* ignore */
        }
        router.replace("/login");
      })();
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
    toast.success(demo ? "Demo signed in" : "Signed in", data.user.email);
  }, []);

  const loginWithSession = useCallback(async (email: string, password: string) => {
    // Drop leftover console JWT so driver cannot send a dead Bearer.
    // Keep demo-mode toggle — portfolio skip-booking still needs it.
    clearToken();
    setTokenState(null);

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
      const bridge = await hydrateGoBridgeToken({ email, password });
      setTokenState(bridge);
      if (!bridge) {
        throw new Error("Signed in, but could not link API access. Try again in a moment.");
      }
      toast.success("Signed in", mapped.email);
      return { role: mapped.role };
    }
    await refresh();
    const cached = getCachedUser<User>();
    toast.success("Signed in");
    return { role: cached?.role };
  }, [refresh]);

  const signupWithSession = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      clearToken();
      setTokenState(null);

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
        const bridge = await hydrateGoBridgeToken({
          email: input.email,
          password: input.password,
        });
        setTokenState(bridge);
        if (!bridge) {
          throw new Error("Account created, but could not link API access. Try signing in again.");
        }
        toast.success("Account created", mapped.email);
        return { role: mapped.role };
      }
      await refresh();
      const cached = getCachedUser<User>();
      toast.success("Account created");
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
    toast.info("Signed out");
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
