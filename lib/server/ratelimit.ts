import "server-only";
import { fail } from "./http";

/* Fixed-window limiter. In-memory per server instance: enough to blunt brute
   force and abuse on a single host; put a shared limiter (e.g. Upstash, or
   your CDN's rate limiting) in front for multi-instance production. */
const buckets = new Map<string, { n: number; reset: number }>();

export function ip(req: Request) {
  return req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}

/** Returns a 429 Response when over the limit, otherwise null. */
export function limit(key: string, max: number, windowSec: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) { buckets.set(key, { n: 1, reset: now + windowSec * 1000 }); return null; }
  b.n += 1;
  if (b.n > max) {
    const r = fail(429, "Too many requests. Please wait a moment and try again.");
    r.headers.set("retry-after", String(Math.ceil((b.reset - now) / 1000)));
    return r;
  }
  if (buckets.size > 50_000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
  return null;
}
