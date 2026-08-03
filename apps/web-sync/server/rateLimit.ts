import type { NextRequest } from "next/server";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let callsSinceSweep = 0;

function sweepExpired(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Best-effort in-memory sliding-window limiter. It's scoped to a single warm
 * serverless instance — Vercel can route bursts across multiple instances,
 * so this isn't a hard guarantee under scale — but it blocks single-instance
 * abuse without needing external infra (e.g. Upstash Redis) up front.
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  callsSinceSweep += 1;
  if (callsSinceSweep >= 1000) {
    callsSinceSweep = 0;
    sweepExpired(now);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  bucket.count += 1;
  return bucket.count > limit;
}

export function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export function rateLimitResponse() {
  return Response.json({ error: "Muitas tentativas. Aguarde um instante e tente novamente." }, { status: 429 });
}
