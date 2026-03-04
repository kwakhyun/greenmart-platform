import { z } from "zod";

// ============================================================
// Zod 런타임 검증 스키마 - 폼 입력 및 API 요청/응답 검증
// ============================================================

/** 상품 등록/수정 폼 스키마 */
export const ProductFormSchema = z
  .object({
    name: z
      .string()
      .min(2, "상품명은 2자 이상이어야 합니다")
      .max(100, "상품명은 100자 이하여야 합니다"),
    brandId: z.string().min(1, "브랜드를 선택해주세요"),
    categoryId: z.string().min(1, "카테고리를 선택해주세요"),
    originalPrice: z
      .number()
      .min(100, "가격은 100원 이상이어야 합니다")
      .max(10000000, "가격은 1000만원 이하여야 합니다"),
    salePrice: z.number().min(0, "할인가는 0원 이상이어야 합니다"),
    description: z.string().min(10, "상품 설명은 10자 이상이어야 합니다"),
    shortDescription: z.string().max(200, "간단 설명은 200자 이하여야 합니다"),
    volume: z.string().optional(),
    skinType: z.array(z.string()).optional(),
    tags: z.array(
      z.enum([
        "BEST",
        "NEW",
        "SALE",
        "TODAY_DEAL",
        "ONLINE_ONLY",
        "EDITOR_PICK",
        "GLOBAL",
      ]),
    ),
    salesChannels: z
      .array(z.enum(["ONLINE", "OFFLINE", "GLOBAL"]))
      .min(1, "판매 채널을 1개 이상 선택해주세요"),
    status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK", "DISCONTINUED"]),
  })
  .refine((data) => data.salePrice <= data.originalPrice, {
    message: "할인가는 정가보다 낮아야 합니다",
    path: ["salePrice"],
  });

export type ProductFormData = z.infer<typeof ProductFormSchema>;

/** 회원 등록 폼 스키마 */
export const CustomerFormSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상이어야 합니다").max(50),
  email: z.string().email("올바른 이메일 형식이어야 합니다"),
  phone: z
    .string()
    .regex(
      /^01[0-9]-\d{3,4}-\d{4}$/,
      "올바른 전화번호 형식이어야 합니다 (01x-xxxx-xxxx)",
    ),
  grade: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]).default("BRONZE"),
  status: z.enum(["ACTIVE", "DORMANT", "WITHDRAWN"]).default("ACTIVE"),
  joinChannel: z.enum(["ONLINE", "OFFLINE", "APP", "GLOBAL"]),
});

export type CustomerFormData = z.infer<typeof CustomerFormSchema>;

/** 주문 상태 변경 스키마 */
export const OrderStatusUpdateSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
    "PARTIALLY_REFUNDED",
  ]),
});

export type OrderStatusUpdateData = z.infer<typeof OrderStatusUpdateSchema>;

/** 회원 검색 쿼리 스키마 */
export const CustomerSearchSchema = z.object({
  query: z.string().max(100).optional(),
  grade: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]).optional(),
  status: z.enum(["ACTIVE", "DORMANT", "WITHDRAWN"]).optional(),
  joinChannel: z.enum(["ONLINE", "OFFLINE", "APP", "GLOBAL"]).optional(),
  page: z.number().int().min(1).default(1),
  size: z.number().int().min(1).max(100).default(20),
});

export type CustomerSearchParams = z.infer<typeof CustomerSearchSchema>;

/** 주문 필터 스키마 */
export const OrderFilterSchema = z.object({
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
      "PARTIALLY_REFUNDED",
    ])
    .optional(),
  search: z.string().max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  paymentMethod: z
    .enum([
      "CREDIT_CARD",
      "DEBIT_CARD",
      "BANK_TRANSFER",
      "VIRTUAL_ACCOUNT",
      "KAKAO_PAY",
      "NAVER_PAY",
      "TOSS_PAY",
      "POINTS",
    ])
    .optional(),
});

export type OrderFilterParams = z.infer<typeof OrderFilterSchema>;

/** 정산 조회 스키마 */
export const SettlementQuerySchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/, "YYYY-MM 형식이어야 합니다"),
  partnerId: z.string().optional(),
  status: z
    .enum(["PENDING", "CALCULATED", "CONFIRMED", "PAID", "DISPUTED"])
    .optional(),
});

export type SettlementQueryParams = z.infer<typeof SettlementQuerySchema>;

/** API 공통 에러 응답 스키마 */
export const ApiErrorSchema = z.object({
  status: z.number(),
  message: z.string(),
  code: z.string().optional(),
  details: z.record(z.string(), z.array(z.string())).optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

/** 페이지네이션 쿼리 스키마 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
