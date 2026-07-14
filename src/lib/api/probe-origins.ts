/** Shared origins for health warm / Observe probes. */

export function bffOrigin(): string {
  return (process.env.NEXT_PUBLIC_BFF_URL ?? "http://localhost:4000").replace(/\/$/, "");
}

/**
 * Go API origin — must not resolve from BFF `NEXT_PUBLIC_API_BASE_URL`
 * (prod API is usually BFF `/api/v1`, which made “Go /readyz” hit the BFF).
 */
export function goOrigin(): string {
  const explicit = (process.env.NEXT_PUBLIC_GO_API_URL ?? "").trim().replace(/\/$/, "");
  if (explicit) {
    return explicit.replace(/\/api\/v1\/?$/, "");
  }

  const api = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api/v1").replace(
    /\/$/,
    "",
  );
  const stripped = api.replace(/\/api\/v1\/?$/, "");
  const bff = bffOrigin();

  // If API base is the BFF, fall back to known Go hosts.
  if (stripped === bff || /spotsync-bff/i.test(stripped)) {
    if (bff.includes("localhost") || bff.includes("127.0.0.1")) {
      return "http://localhost:8081";
    }
    return "https://spotsync-ei6g.onrender.com";
  }

  return stripped || "http://localhost:8081";
}
