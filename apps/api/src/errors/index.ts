/**
 * 비즈니스 로직 에러의 기본 클래스
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource}(${id})을(를) 찾을 수 없습니다.`
      : `${resource}을(를) 찾을 수 없습니다.`;
    super(404, `${resource}_NOT_FOUND`, message);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly details?: Record<string, string[]>,
  ) {
    super(400, "VALIDATION_ERROR", message);
    this.name = "ValidationError";
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, code = "BAD_REQUEST") {
    super(400, code, message);
    this.name = "BadRequestError";
  }
}
