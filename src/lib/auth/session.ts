"use client";

const TOKEN_KEY = "spotsync_token";
const DEMO_SESSION_KEY = "spotsync_demo_session";
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
  } else {
    localStorage.removeItem(DEMO_SESSION_KEY);
  }
}

export function clearSession() {
  clearToken();
  localStorage.removeItem(DEMO_SESSION_KEY);
  localStorage.removeItem(USER_KEY);
}
