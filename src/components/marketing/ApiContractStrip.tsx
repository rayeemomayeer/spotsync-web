import Link from "next/link";

/** Graded B6A6 surface — frozen contract from SpotSync server. */
const endpoints = [
  { method: "POST", path: "/api/v1/auth/register" },
  { method: "POST", path: "/api/v1/auth/login" },
  { method: "POST", path: "/api/v1/zones" },
  { method: "GET", path: "/api/v1/zones" },
  { method: "GET", path: "/api/v1/zones/:id" },
  { method: "POST", path: "/api/v1/reservations" },
  { method: "GET", path: "/api/v1/reservations/my-reservations" },
  { method: "DELETE", path: "/api/v1/reservations/:id" },
  { method: "GET", path: "/api/v1/reservations" },
];

export function ApiContractStrip() {
  return (
    <section className="contract-strip" aria-labelledby="contract-heading">
      <div className="contract-strip__intro">
        <p className="contract-strip__eyebrow">Frozen contract</p>
        <h2 id="contract-heading" className="contract-strip__title">
          Nine graded endpoints — additive only
        </h2>
        <p className="contract-strip__lede">
          SpotSync keeps the B6A6 surface stable. New product UI routes through this Go API; shapes
          do not rename or break.
        </p>
      </div>
      <ol className="contract-strip__list">
        {endpoints.map((e) => (
          <li key={`${e.method}-${e.path}`}>
            <span className="contract-strip__method font-mono">{e.method}</span>
            <code className="contract-strip__path">{e.path}</code>
          </li>
        ))}
      </ol>
      <p className="contract-strip__cta">
        <Link href="/developers">Developer notes →</Link>
      </p>
    </section>
  );
}
