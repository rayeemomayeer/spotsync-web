import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { siteConfig } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: `Developers — ${siteConfig.name}`,
  description: "SpotSync API documentation, OpenAPI spec, and integration surface.",
};

function goOpenApiUrl(): string {
  const raw = process.env.NEXT_PUBLIC_GO_OPENAPI_URL ?? "";
  if (raw) return raw.replace(/\/$/, "");
  const api = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api/v1";
  return api.replace(/\/api\/v1\/?$/, "") + "/openapi.yaml";
}

const endpoints = [
  { method: "GET", path: "/api/v1/zones", note: "Public marketplace inventory (search, sort, FTS)" },
  { method: "POST", path: "/api/v1/reservations", note: "Driver reserve — pay-then-reserve via BFF checkout" },
  { method: "GET", path: "/api/v1/reservations/my-reservations", note: "Driver bookings + payment_status" },
  { method: "POST", path: "/api/checkout/payment-intent", note: "BFF Stripe PaymentIntent (driver)" },
  { method: "GET", path: "/api/v1/orgs", note: "Platform org roster (saas_admin)" },
  { method: "GET", path: "/api/auth/get-session", note: "Better Auth session cookie (BFF)" },
];

export default function DevelopersPage() {
  const openApi = goOpenApiUrl();
  const bff = process.env.NEXT_PUBLIC_BFF_URL ?? "http://localhost:4000";

  return (
    <div className="shell">
      <AppHeader tag="Developers" />
      <main className="shell-main">
        <div className="shell-card">
          <h1>Developer portal</h1>
          <p>
            SpotSync = Go reservation engine + Express BFF (Better Auth, Stripe) + Next.js web. The graded contract
            keeps nine core endpoints stable; SaaS features are additive.
          </p>

          <section className="dev-spec-links">
            <h2>OpenAPI</h2>
            <ul>
              <li>
                <a href={openApi} target="_blank" rel="noopener noreferrer">
                  Go API — openapi.yaml
                </a>
              </li>
              <li>
                <span>
                  BFF OpenAPI: <code>spotsync-bff/openapi.yaml</code> in repo
                </span>
              </li>
            </ul>
            <p>
              View interactively: paste the Go spec URL into{" "}
              <a href="https://editor.swagger.io/" target="_blank" rel="noopener noreferrer">
                Swagger Editor
              </a>{" "}
              or run Scalar locally.
            </p>
          </section>

          <h2 style={{ fontSize: "1.1rem", marginTop: "1.5rem" }}>Base URLs</h2>
          <ul className="console-zone-list" style={{ marginBottom: "1.25rem" }}>
            <li className="shell-card" style={{ boxShadow: "none" }}>
              <strong>BFF</strong>
              <p style={{ margin: "0.35rem 0 0" }}>
                <code>{bff}</code> — auth cookies, checkout, proxy to Go
              </p>
            </li>
            <li className="shell-card" style={{ boxShadow: "none" }}>
              <strong>Go API</strong>
              <p style={{ margin: "0.35rem 0 0" }}>
                <code>{openApi.replace("/openapi.yaml", "")}</code>
              </p>
            </li>
          </ul>

          <h2 style={{ fontSize: "1.1rem" }}>Core surface</h2>
          <ul className="console-zone-list">
            {endpoints.map((ep) => (
              <li key={ep.path + ep.method} className="shell-card" style={{ boxShadow: "none" }}>
                <strong>
                  {ep.method} {ep.path}
                </strong>
                <p style={{ margin: "0.35rem 0 0" }}>{ep.note}</p>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: "1.25rem" }}>
            <Link href="/">← Home</Link>
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
