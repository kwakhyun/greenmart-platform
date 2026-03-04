import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";

/**
 * Zod 스키마 기반 요청 검증 미들웨어
 * query, body, params 를 각각 검증할 수 있습니다.
 */
export function validate(schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Record<string, string>;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Record<string, string>;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string[]> = {};
        error.errors.forEach((e) => {
          const path = e.path.join(".");
          if (!details[path]) details[path] = [];
          details[path].push(e.message);
        });

        res.status(400).json({
          status: 400,
          message: "유효성 검증에 실패했습니다.",
          code: "VALIDATION_ERROR",
          details,
        });
        return;
      }
      next(error);
    }
  };
}
