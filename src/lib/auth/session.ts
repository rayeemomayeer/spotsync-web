"use client";

const TOKEN_KEY = "spotsync_token";
const DEMO_SESSION_KEY = "spotsync_demo_session";
const DEMO_SESSION_ID_KEY = "spotsync_demo_session_id";
const USER_KEY = "spotsync_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getCachedUser<T>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setCachedUser(user: unknown) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isDemoSession(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DEMO_SESSION_KEY) === "1";
}

export function setDemoSession(value: boolean) {
  if (value) {
    localStorage.setItem(DEMO_SESSION_KEY, "1");
    if (!localStorage.getItem(DEMO_SESSION_ID_KEY)) {
      localStorage.setItem(DEMO_SESSION_ID_KEY, crypto.randomUUID());
    }
  } else {
    localStorage.removeItem(DEMO_SESSION_KEY);
    localStorage.removeItem(DEMO_SESSION_ID_KEY);
  }
}

export function getDemoSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(DEMO_SESSION_ID_KEY);
}

export function isDemoModeActive(): boolean {
  return isDemoSession();
}

/** True when portfolio demo tooling should be available (env, flag, or session toggle). */
export function canUseDemoBooking(): boolean {
  if (typeof window === "undefined") {
    return (
      process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
      (process.env.NEXT_PUBLIC_FEATURE_FLAGS ?? "").split(",").some((s) => s.trim() === "demo_mode")
    );
  }
  if (isDemoSession()) return true;
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;
  return (process.env.NEXT_PUBLIC_FEATURE_FLAGS ?? "")
    .split(",")
    .map((s) => s.trim())
    .includes("demo_mode");
}

/** Ensure demo session id exists so BFF can attribute sandbox reservations. */
export function ensureDemoSessionActive(): string | null {
  if (!isDemoSession()) {
    setDemoSession(true);
  }
  return getDemoSessionId();
}

export function clearSession() {
  clearToken();
  localStorage.removeItem(DEMO_SESSION_KEY);
  localStorage.removeItem(DEMO_SESSION_ID_KEY);
  localStorage.removeItem(USER_KEY);
}
