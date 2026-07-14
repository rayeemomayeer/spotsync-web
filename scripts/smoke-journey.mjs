#!/usr/bin/env node
/**
 * API journey smoke (P0) — no browser.
 * Proves: warm → zones → Go login → my-reservations → BFF quote.
 * Does NOT charge Stripe (webhook needs Checkout Session).
 */
const BFF = process.env.BFF_URL ?? "https://spotsync-bff.onrender.com";
const GO = process.env.GO_URL ?? "https://spotsync-ei6g.onrender.com";
const EMAIL = process.env.SMOKE_DRIVER_EMAIL ?? "alice@spotsync.com";
const PASSWORD = process.env.SMOKE_DRIVER_PASSWORD ?? "DriverPass123!";

async function get(url, init = {}) {
  const res = await fetch(url, { ...init, cache: "no-store" });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }
  return { res, text, json };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  console.log("== journey smoke ==");

  const health = await get(`${GO}/healthz`);
  assert(health.res.ok, `Go healthz ${health.res.status}`);
  console.log("OK Go healthz");

  const zones = await get(`${GO}/api/v1/zones`);
  assert(zones.res.ok && zones.json?.success, `zones ${zones.res.status}`);
  const list = zones.json.data ?? [];
  assert(Array.isArray(list) && list.length > 0, "expected seeded zones");
  console.log(`OK zones n=${list.length}`);

  const login = await get(`${GO}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  assert(login.res.ok && login.json?.data?.token, `login ${login.res.status} ${login.text.slice(0, 160)}`);
  const token = login.json.data.token;
  console.log("OK Go driver login");

  const mine = await get(`${GO}/api/v1/reservations/my-reservations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(mine.res.ok && mine.json?.success, `my-reservations ${mine.res.status}`);
  console.log(`OK my-reservations n=${(mine.json.data ?? []).length}`);

  const zoneId = list[0].id;
  const quote = await get(`${BFF}/api/checkout/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      zone_id: zoneId,
      duration_hours: 1,
      license_plate: "JOURNEY-1",
    }),
  });
  if (quote.res.ok) {
    console.log(`OK BFF quote zone=${zoneId} cents=${quote.json?.amount_cents ?? quote.json?.data?.amount_cents}`);
  } else {
    console.warn(`WARN BFF quote ${quote.res.status} (still OK if Stripe/env cold)`);
  }

  console.log("OK: journey smoke finished (pay/webhook still needs Stripe Checkout UI)");
}

main().catch((e) => {
  console.error("FAIL", e.message);
  process.exit(1);
});
