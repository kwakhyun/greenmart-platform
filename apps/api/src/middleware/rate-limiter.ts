import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

/**
 * 인메모리 레이트 리미터 미들웨어
 *
 * - IP 기반 요청 횟수 제한
 * - 슬라이딩 윈도우 방식
 * - 429 Too Many Requests 응답 + Retry-After 헤더
 */
export function rateLimiter(
  options: {
    windowMs?: number;
    maxRequests?: number;
  } = {},
) {
  const { windowMs = 60_000, maxRequests = 100 } = options;
  const store = new Map<string, RateLimitStore>();

  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of store) {
      if (value.resetTime <= now) {
        store.delete(key);
      }
    }
  }, windowMs);

  cleanupTimer.unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const record = store.get(key);

    if (!record || record.resetTime <= now) {
      store.set(key, { count: 1, resetTime: now + windowMs });
      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", maxRequests - 1);
      res.setHeader("X-RateLimit-Reset", Math.ceil((now + windowMs) / 1000));
      next();
      return;
    }

    record.count += 1;
    const remaining = Math.max(0, maxRequests - record.count);

    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));

    if (record.count > maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      res.status(429).json({
        status: 429,
        message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter,
      });
      return;
    }

    next();
  };
}
