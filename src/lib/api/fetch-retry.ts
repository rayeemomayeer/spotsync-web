/** Render free tier: first request after sleep often stalls or fails. */
export async function fetchWithColdStartRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  opts?: { attempts?: number; timeoutMs?: number },
): Promise<Response> {
  const attempts = opts?.attempts ?? 4;
  const timeoutMs = opts?.timeoutMs ?? 90_000;
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(input, {
        ...init,
        signal: AbortSignal.timeout(timeoutMs),
      });
      // Retry gateway / upstream sleeps; keep 4xx (except 408/429).
      if (
        res.ok ||
        (res.status >= 400 &&
          res.status < 500 &&
          res.status !== 408 &&
          res.status !== 429)
      ) {
        return res;
      }
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    if (i < attempts - 1) {
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Request failed after retries");
}
