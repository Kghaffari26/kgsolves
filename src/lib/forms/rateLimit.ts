import "server-only";

/**
 * Small sliding-window limiter keyed by IP. In-memory, so on serverless it limits per
 * instance: enough to stop a single bot hammering one function. For stronger guarantees,
 * swap the Map for Upstash Redis / Vercel KV (same interface).
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, { limit = 5, windowMs = 10 * 60 * 1000 } = {}) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return { ok: false, retryAfterMs: windowMs - (now - recent[0]) };
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  }
  return { ok: true, retryAfterMs: 0 };
}
