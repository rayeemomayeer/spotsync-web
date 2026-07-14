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
  { method: "POST", path: "/api/checkout/session", note: "BFF Stripe Checkout Session (driver, test mode)" },
  { method: "POST", path: "/api/stripe/checkout", note: "BFF Stripe Checkout Session (org/platform subscription)" },
  { method: "GET", path: "/api/v1/orgs", note: "Platform org roster (saas_admin)" },
  { method: "GET", path: "/api/auth/get-session", note: "Better Auth session cookie (BFF)" },
];

export default function DevelopersPage() {
  const openApi = goOpenApiUrl();
  const bff = process.env.NEXT_PUBLIC_BFF_URL ?? "http://localhost:4000";
  const goBase = openApi.replace("/openapi.yaml", "");

  return (
    <div className="shell">
      <AppHeader tag="Developers" />
      <main className="shell-main">
        <article className="page-prose">
          <h1>Developer portal</h1>
          <p>
            SpotSync = Go reservation engine + Express BFF (Better Auth, Stripe) + Next.js web. The graded contract
            keeps nine core endpoints stable; SaaS features are additive.
          </p>

          <h2>OpenAPI</h2>
          <ul>
            <li>
              <a href={openApi} target="_blank" rel="noopener noreferrer">
                Go API — openapi.yaml
              </a>
            </li>
            <li>
              BFF OpenAPI: <code>spotsync-bff/openapi.yaml</code> in repo
            </li>
          </ul>
          <p>
            View interactively: paste the Go spec URL into{" "}
            <a href="https://editor.swagger.io/" target="_blank" rel="noopener noreferrer">
              Swagger Editor
            </a>{" "}
            or run Scalar locally.
          </p>

          <h2>Base URLs</h2>
          <ul className="data-list">
            <li className="data-list__row">
              <strong>BFF</strong>
              <p>
                <code>{bff}</code> — auth cookies, checkout, proxy to Go
              </p>
            </li>
            <li className="data-list__row">
              <strong>Go API</strong>
              <p>
                <code>{goBase}</code>
              </p>
            </li>
          </ul>

          <h2>Core surface</h2>
          <ul className="data-list">
            {endpoints.map((ep) => (
              <li key={ep.path + ep.method} className="endpoint-row">
                <span className="endpoint-row__method">{ep.method}</span>
                <code className="endpoint-row__path">{ep.path}</code>
                <p className="endpoint-row__note">{ep.note}</p>
              </li>
            ))}
          </ul>

          <p>
            <Link href="/">← Home</Link>
          </p>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}
