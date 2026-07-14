import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const BFF_ORIGIN = (
  process.env.BFF_PROXY_ORIGIN ??
  process.env.NEXT_PUBLIC_BFF_PROXY_ORIGIN ??
  "https://spotsync-bff.onrender.com"
).replace(/\/$/, "");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' http://localhost:* https://localhost:* ws://localhost:* wss://localhost:* https: http:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  // Prefer same-origin cookies locally via rewrite; production auth goes
  // direct to NEXT_PUBLIC_BFF_URL (see auth/client.ts) so Vercel↔Render
  // cold starts do not return 504 Gateway Timeout.
  async rewrites() {
    return [
      { source: "/api/auth/:path*", destination: `${BFF_ORIGIN}/api/auth/:path*` },
      { source: "/healthz", destination: `${BFF_ORIGIN}/healthz` },
      { source: "/readyz", destination: `${BFF_ORIGIN}/readyz` },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  widenClientFileUpload: true,
});
