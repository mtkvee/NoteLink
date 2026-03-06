type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  intervalMs: number;
  maxRequests: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const rateLimitStore = globalThis as typeof globalThis & {
  __noteLinkRateLimitStore__?: Map<string, RateLimitEntry>;
};

const store = rateLimitStore.__noteLinkRateLimitStore__ ?? new Map<string, RateLimitEntry>();

rateLimitStore.__noteLinkRateLimitStore__ = store;

export function rateLimit(
  key: string,
  { intervalMs, maxRequests }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + intervalMs,
    });

    return {
      allowed: true,
      remaining: Math.max(maxRequests - 1, 0),
      retryAfterSeconds: Math.ceil(intervalMs / 1000),
    };
  }

  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existing.resetAt - now) / 1000),
      ),
    };
  }

  existing.count += 1;
  store.set(key, existing);

  return {
    allowed: true,
    remaining: Math.max(maxRequests - existing.count, 0),
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

export function getRequestIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
