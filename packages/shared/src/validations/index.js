"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationQuerySchema = exports.ApiErrorSchema = exports.SettlementQuerySchema = exports.OrderFilterSchema = exports.CustomerSearchSchema = exports.ProductFormSchema = void 0;
const zod_1 = require("zod");
// ============================================================
// Zod 런타임 검증 스키마 - 폼 입력 및 API 요청/응답 검증
// ============================================================
/** 상품 등록/수정 폼 스키마 */
exports.ProductFormSchema = zod_1.z
    .object({
    name: zod_1.z
        .string()
        .min(2, "상품명은 2자 이상이어야 합니다")
        .max(100, "상품명은 100자 이하여야 합니다"),
    brandId: zod_1.z.string().min(1, "브랜드를 선택해주세요"),
    categoryId: zod_1.z.string().min(1, "카테고리를 선택해주세요"),
    originalPrice: zod_1.z
        .number()
        .min(100, "가격은 100원 이상이어야 합니다")
        .max(10000000, "가격은 1000만원 이하여야 합니다"),
    salePrice: zod_1.z.number().min(0, "할인가는 0원 이상이어야 합니다"),
    description: zod_1.z.string().min(10, "상품 설명은 10자 이상이어야 합니다"),
    shortDescription: zod_1.z.string().max(200, "간단 설명은 200자 이하여야 합니다"),
    volume: zod_1.z.string().optional(),
    skinType: zod_1.z.array(zod_1.z.string()).optional(),
    tags: zod_1.z.array(zod_1.z.enum([
        "BEST",
        "NEW",
        "SALE",
        "TODAY_DEAL",
        "ONLINE_ONLY",
        "EDITOR_PICK",
        "GLOBAL",
    ])),
    salesChannels: zod_1.z
        .array(zod_1.z.enum(["ONLINE", "OFFLINE", "GLOBAL"]))
        .min(1, "판매 채널을 1개 이상 선택해주세요"),
    status: zod_1.z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK", "DISCONTINUED"]),
})
    .refine((data) => data.salePrice <= data.originalPrice, {
    message: "할인가는 정가보다 낮아야 합니다",
    path: ["salePrice"],
});
/** 회원 검색 쿼리 스키마 */
exports.CustomerSearchSchema = zod_1.z.object({
    query: zod_1.z.string().max(100).optional(),
    grade: zod_1.z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]).optional(),
    status: zod_1.z.enum(["ACTIVE", "DORMANT", "WITHDRAWN"]).optional(),
    joinChannel: zod_1.z.enum(["ONLINE", "OFFLINE", "APP", "GLOBAL"]).optional(),
    page: zod_1.z.number().int().min(1).default(1),
    size: zod_1.z.number().int().min(1).max(100).default(20),
});
/** 주문 필터 스키마 */
exports.OrderFilterSchema = zod_1.z.object({
    status: zod_1.z
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
    search: zod_1.z.string().max(100).optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    paymentMethod: zod_1.z
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
/** 정산 조회 스키마 */
exports.SettlementQuerySchema = zod_1.z.object({
    period: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "YYYY-MM 형식이어야 합니다"),
    partnerId: zod_1.z.string().optional(),
    status: zod_1.z
        .enum(["PENDING", "CALCULATED", "CONFIRMED", "PAID", "DISPUTED"])
        .optional(),
});
/** API 공통 에러 응답 스키마 */
exports.ApiErrorSchema = zod_1.z.object({
    status: zod_1.z.number(),
    message: zod_1.z.string(),
    code: zod_1.z.string().optional(),
    details: zod_1.z.record(zod_1.z.string(), zod_1.z.array(zod_1.z.string())).optional(),
});
/** 페이지네이션 쿼리 스키마 */
exports.PaginationQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    size: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
//# sourceMappingURL=index.js.map