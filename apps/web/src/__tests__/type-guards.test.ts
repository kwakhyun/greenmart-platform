import {
  isApiClientError,
  isNotFoundError,
  isValidationError,
  isServerError,
  isDefined,
  isNonEmptyArray,
} from "@/lib/type-guards";
import { ApiClientError } from "@/lib/api-client";

describe("Type Guards", () => {
  describe("isApiClientError", () => {
    it("should return true for ApiClientError instances", () => {
      const error = new ApiClientError(400, "BAD_REQUEST", "잘못된 요청");
      expect(isApiClientError(error)).toBe(true);
    });

    it("should return false for regular Error", () => {
      expect(isApiClientError(new Error("test"))).toBe(false);
    });

    it("should return false for non-error values", () => {
      expect(isApiClientError("string")).toBe(false);
      expect(isApiClientError(null)).toBe(false);
      expect(isApiClientError(undefined)).toBe(false);
    });
  });

  describe("isNotFoundError", () => {
    it("should return true for 404 ApiClientError", () => {
      const error = new ApiClientError(404, "NOT_FOUND", "찾을 수 없음");
      expect(isNotFoundError(error)).toBe(true);
    });

    it("should return false for non-404 ApiClientError", () => {
      const error = new ApiClientError(400, "BAD_REQUEST", "잘못된 요청");
      expect(isNotFoundError(error)).toBe(false);
    });
  });

  describe("isValidationError", () => {
    it("should return true for VALIDATION_ERROR code", () => {
      const error = new ApiClientError(400, "VALIDATION_ERROR", "검증 실패");
      expect(isValidationError(error)).toBe(true);
    });

    it("should return false for other error codes", () => {
      const error = new ApiClientError(400, "BAD_REQUEST", "잘못된 요청");
      expect(isValidationError(error)).toBe(false);
    });
  });

  describe("isServerError", () => {
    it("should return true for 5xx errors", () => {
      expect(
        isServerError(new ApiClientError(500, "INTERNAL", "서버 오류")),
      ).toBe(true);
      expect(
        isServerError(new ApiClientError(503, "UNAVAILABLE", "서비스 불가")),
      ).toBe(true);
    });

    it("should return false for 4xx errors", () => {
      expect(isServerError(new ApiClientError(404, "NOT_FOUND", "없음"))).toBe(
        false,
      );
    });
  });

  describe("isDefined", () => {
    it("should return true for defined values", () => {
      expect(isDefined(0)).toBe(true);
      expect(isDefined("")).toBe(true);
      expect(isDefined(false)).toBe(true);
      expect(isDefined([])).toBe(true);
    });

    it("should return false for null and undefined", () => {
      expect(isDefined(null)).toBe(false);
      expect(isDefined(undefined)).toBe(false);
    });
  });

  describe("isNonEmptyArray", () => {
    it("should return true for non-empty arrays", () => {
      expect(isNonEmptyArray([1, 2, 3])).toBe(true);
      expect(isNonEmptyArray(["a"])).toBe(true);
    });

    it("should return false for empty arrays", () => {
      expect(isNonEmptyArray([])).toBe(false);
    });

    it("should return false for null/undefined", () => {
      expect(isNonEmptyArray(null)).toBe(false);
      expect(isNonEmptyArray(undefined)).toBe(false);
    });
  });
});
