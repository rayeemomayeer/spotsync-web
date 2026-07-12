/** Optional Sentry — set NEXT_PUBLIC_SENTRY_DSN to enable (free tier). */
export function initClientObservability(): void {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  if (!dsn || typeof window === "undefined") return;
  // Lightweight stub: log DSN presence without bundling Sentry until wired.
  console.info("[spotsync] client observability ready", { sentry: true });
}
