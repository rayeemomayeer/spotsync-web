import { NextResponse } from "next/server";
import { parsePromText, toSpotSyncSnapshot } from "@/lib/metrics/prom";

export const dynamic = "force-dynamic";

function metricsOrigin(): string {
  const explicit = (process.env.GO_METRICS_URL ?? process.env.NEXT_PUBLIC_GO_API_URL ?? "").trim();
  if (explicit) return explicit.replace(/\/$/, "").replace(/\/api\/v1\/?$/, "");
  if (process.env.NODE_ENV === "production") {
    return "https://spotsync-ei6g.onrender.com";
  }
  return "http://localhost:8081";
}

/** Proxy Go /metrics for platform Observe Grafana panels (server-side token). */
export async function GET() {
  const origin = metricsOrigin();
  const token = (process.env.METRICS_TOKEN ?? "").trim();
  const url = token
    ? `${origin}/metrics?token=${encodeURIComponent(token)}`
    : `${origin}/metrics`;

  const headers: Record<string, string> = { Accept: "text/plain" };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(url, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message: `metrics upstream ${res.status}`,
          errors: { metrics: res.statusText || String(res.status) },
        },
        { status: 502 },
      );
    }
    const text = await res.text();
    const snapshot = toSpotSyncSnapshot(parsePromText(text));
    return NextResponse.json({
      success: true,
      message: "ok",
      data: {
        snapshot,
        source: `${origin}/metrics`,
        panels: [
          "Reserve p95 latency",
          "Oversell rejections",
          "Zone cache hit ratio",
          "Outbox dead letters",
        ],
      },
    });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        message: "metrics fetch failed",
        errors: { metrics: e instanceof Error ? e.message : "unknown" },
      },
      { status: 502 },
    );
  }
}
