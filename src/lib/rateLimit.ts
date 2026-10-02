// src/lib/rateLimit.ts
// Simple in-memory rate limiter — per user, per endpoint.
// Works per serverless instance. Good enough for protecting expensive AI/publish calls.

type RateLimitEntry = { count: number; resetAt: number };
const store = new Map<string, RateLimitEntry>();

/**
 * Check and record a rate-limited action.
 * @param key      Unique key, e.g. `generate:user-123`
 * @param limit    Max requests allowed in the window
 * @param windowMs Time window in milliseconds
 * @returns { allowed: boolean; remaining: number; resetAt: number }
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/** Build a rate-limit exceeded NextResponse */
export function rateLimitResponse(resetAt: number) {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please slow down.', retryAfterSeconds: retryAfter }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
      },
    }
  );
}
