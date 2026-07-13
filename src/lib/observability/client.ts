import * as Sentry from "@sentry/nextjs";

/** Init Sentry browser SDK when NEXT_PUBLIC_SENTRY_DSN is set. */
export function initClientObservability(): void {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  if (!dsn || typeof window === "undefined") return;
  Sentry.init({
    dsn,
    tracesSampleRate: 0.2,
    environment: process.env.NODE_ENV,
  });
}

export function captureClientError(error: unknown, context?: Record<string, unknown>): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()) return;
  Sentry.captureException(error, { extra: context });
}
