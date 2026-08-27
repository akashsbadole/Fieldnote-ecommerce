import "server-only";
import { headers } from "next/headers";

/**
 * In-memory sliding-window rate limiter, keyed by an arbitrary string
 * (IP, email, user id — whatever makes sense for the endpoint).
 *
 * This is process-local: it resets on restart and doesn't share state
 * across instances. Fine for a single-server deployment or demo; once
 * you're running more than one instance, swap this for a shared store
 * (Upstash Redis + @upstash/ratelimit is the standard choice on Vercel).
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodic cleanup so the map doesn't grow forever in a long-running process.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 5 * 60 * 1000).unref?.();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true };
}

/** Best-effort client IP from standard proxy headers. Falls back to a
 * constant bucket if none are present (e.g. local dev without a proxy) —
 * rate limiting by email/user-id on top of this still protects those cases. */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = h.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
