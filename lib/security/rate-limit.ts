/**
 * Small in-memory fixed-window rate limiter. Per server instance, which is fine
 * as a brute-force / spam guard; use a shared store if you need exact global limits.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  const sweep = (now: number) => {
    if (hits.size < 5000) return;
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
  };

  return {
    check(key: string) {
      const now = Date.now();
      sweep(now);
      const cur = hits.get(key);
      if (!cur || cur.resetAt <= now) {
        hits.set(key, { count: 1, resetAt: now + windowMs });
        return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
      }
      cur.count += 1;
      const retryAfterSeconds = Math.max(1, Math.ceil((cur.resetAt - now) / 1000));
      return { ok: cur.count <= limit, remaining: Math.max(0, limit - cur.count), retryAfterSeconds };
    },
    reset(key: string) {
      hits.delete(key);
    },
  };
}
