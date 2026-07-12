"use client";

import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

const endpoints = [
  { method: "GET", path: "/api/v1/zones", note: "Public marketplace inventory" },
  { method: "POST", path: "/api/v1/reservations", note: "Driver reserve (JWT via BFF)" },
  { method: "GET", path: "/api/v1/orgs", note: "Platform org roster" },
  { method: "GET", path: "/api/auth/get-session", note: "Better Auth session (BFF)" },
];

/** Lightweight developer portal — OpenAPI links + endpoint index. */
export default function DevelopersPage() {
  const apiDocs = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/v1\/?$/, "") ?? "http://localhost:8081";

  return (
    <div className="shell">
      <AppHeader tag="Developers" />
      <main className="shell-main">
        <div className="shell-card">
          <h1>Developer portal</h1>
          <p>
            SpotSync exposes a Go reservation engine and an Express BFF. Machine-readable specs live in each repo (
            <code>openapi.yaml</code>).
          </p>
          <p>
            Go OpenAPI (served from repo):{" "}
            <a href={`${apiDocs}/../openapi.yaml`} onClick={(e) => e.preventDefault()}>
              see SpotSync-server/openapi.yaml
            </a>
          </p>
          <h2 style={{ fontSize: "1.1rem", marginTop: "1.5rem" }}>Core surface</h2>
          <ul className="console-zone-list">
            {endpoints.map((ep) => (
              <li key={ep.path} className="shell-card" style={{ boxShadow: "none" }}>
                <strong>
                  {ep.method} {ep.path}
                </strong>
                <p style={{ margin: "0.35rem 0 0" }}>{ep.note}</p>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: "1.25rem" }}>
            <Link href="/">← Back to SpotSync</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
