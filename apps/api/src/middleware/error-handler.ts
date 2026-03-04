import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../errors";
import { logger } from "../lib/logger";

/**
 * 글로벌 에러 핸들러 미들웨어
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
      code: err.code,
    });
    return;
  }

  logger.error("Unhandled error", { message: err.message, stack: err.stack });

  res.status(500).json({
    status: 500,
    message: "서버 내부 오류가 발생했습니다.",
    code: "INTERNAL_SERVER_ERROR",
  });
}

/**
 * 404 Not Found 핸들러
 */
export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    status: 404,
    message: "요청하신 리소스를 찾을 수 없습니다.",
    code: "NOT_FOUND",
  });
}
