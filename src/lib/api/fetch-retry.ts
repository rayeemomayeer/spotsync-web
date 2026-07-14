/** Render free tier: first request after sleep often stalls or fails. */

export class ColdStartError extends Error {
  readonly causeStatus?: number;

  constructor(message: string, causeStatus?: number) {
    super(message);
    this.name = "ColdStartError";
    this.causeStatus = causeStatus;
  }
}

const COLD_START_HINT =
  "API is waking from free-tier sleep (often 30–90s). Leave this tab open and try again.";

export function isColdStartFailure(err: unknown, status?: number): boolean {
  if (typeof status === "number" && (status === 502 || status === 503 || status === 504 || status === 408)) {
    return true;
  }
  if (err instanceof ColdStartError) return true;
  if (!(err instanceof Error)) return false;
  const msg = err.message;
  const name = err.name;
  return (
    name === "TimeoutError" ||
    name === "AbortError" ||
    /timeout|aborted|gateway|504|503|502|failed to fetch|networkerror|load failed/i.test(msg)
  );
}

export function toAuthUserMessage(err: unknown): string {
  if (isColdStartFailure(err)) {
    return COLD_START_HINT;
  }
  if (err instanceof Error && err.message.trim()) {
    return err.message;
  }
  return "Sign in failed";
}

export async function fetchWithColdStartRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  opts?: { attempts?: number; timeoutMs?: number },
): Promise<Response> {
  const attempts = opts?.attempts ?? 5;
  const timeoutMs = opts?.timeoutMs ?? 90_000;
  let lastError: unknown;
  let lastStatus: number | undefined;

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
      lastStatus = res.status;
      lastError = new ColdStartError(`HTTP ${res.status}`, res.status);
    } catch (err) {
      lastError = err;
    }
    if (i < attempts - 1) {
      // Exponential backoff; keep trying while Render boots.
      await new Promise((r) => setTimeout(r, Math.min(8_000, 1_200 * 2 ** i)));
    }
  }

  if (isColdStartFailure(lastError, lastStatus)) {
    throw new ColdStartError(COLD_START_HINT, lastStatus);
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Request failed after retries");
}
