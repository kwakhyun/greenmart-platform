import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

/**
 * API 요청/응답 시간 측정 미들웨어
 *
 * - 각 요청의 응답 시간을 ms 단위로 측정
 * - 느린 요청(> 1초)은 warn 레벨로 기록
 * - 응답 헤더에 X-Response-Time 추가
 */
export function responseTimeMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = process.hrtime.bigint();

  const originalWriteHead = res.writeHead;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (res as any).writeHead = function (...args: any[]) {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    const rounded = Math.round(durationMs * 100) / 100;
    res.setHeader("X-Response-Time", `${rounded}ms`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (originalWriteHead as (...a: any[]) => any).apply(res, args);
  };

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    const rounded = Math.round(durationMs * 100) / 100;

    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${rounded}ms`,
    };

    if (durationMs > 1000) {
      logger.warn("Slow request detected", logData);
    } else {
      logger.http("Request completed", logData);
    }
  });

  next();
}
