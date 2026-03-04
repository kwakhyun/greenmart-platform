// ============================================================
// API 공통 응답 타입
// ============================================================

/** API 성공 응답 래퍼 */
export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

/** API 에러 응답 */
export interface ApiErrorResponse {
  status: number;
  message: string;
  code: string;
  details?: Record<string, string[]>;
}
