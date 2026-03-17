import { ApiClientError } from "@/lib/api-client";

/** ApiClientError 런타임 타입 가드 */
export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}

/** 404 Not Found 에러 여부 */
export function isNotFoundError(error: unknown): boolean {
  return isApiClientError(error) && error.status === 404;
}

/** 유효성 검증 에러 여부 */
export function isValidationError(error: unknown): boolean {
  return isApiClientError(error) && error.code === "VALIDATION_ERROR";
}

/** 서버 에러(5xx) 여부 */
export function isServerError(error: unknown): boolean {
  return isApiClientError(error) && error.status >= 500;
}

/** null/undefined가 아닌 값 타입 가드 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/** 빈 배열이 아닌지 타입 가드 */
export function isNonEmptyArray<T>(
  arr: T[] | null | undefined,
): arr is [T, ...T[]] {
  return Array.isArray(arr) && arr.length > 0;
}

/** Record에 해당 키가 존재하는지 타입 가드 */
export function hasKey<K extends string>(
  obj: Record<string, unknown>,
  key: K,
): obj is Record<K, unknown> {
  return key in obj;
}
