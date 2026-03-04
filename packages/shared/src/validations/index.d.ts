import { z } from "zod";
/** 상품 등록/수정 폼 스키마 */
export declare const ProductFormSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    brandId: z.ZodString;
    categoryId: z.ZodString;
    originalPrice: z.ZodNumber;
    salePrice: z.ZodNumber;
    description: z.ZodString;
    shortDescription: z.ZodString;
    volume: z.ZodOptional<z.ZodString>;
    skinType: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    tags: z.ZodArray<z.ZodEnum<["BEST", "NEW", "SALE", "TODAY_DEAL", "ONLINE_ONLY", "EDITOR_PICK", "GLOBAL"]>, "many">;
    salesChannels: z.ZodArray<z.ZodEnum<["ONLINE", "OFFLINE", "GLOBAL"]>, "many">;
    status: z.ZodEnum<["ACTIVE", "INACTIVE", "OUT_OF_STOCK", "DISCONTINUED"]>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    shortDescription: string;
    originalPrice: number;
    salePrice: number;
    tags: ("BEST" | "NEW" | "SALE" | "TODAY_DEAL" | "ONLINE_ONLY" | "EDITOR_PICK" | "GLOBAL")[];
    salesChannels: ("GLOBAL" | "ONLINE" | "OFFLINE")[];
    status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";
    brandId: string;
    categoryId: string;
    volume?: string | undefined;
    skinType?: string[] | undefined;
}, {
    name: string;
    description: string;
    shortDescription: string;
    originalPrice: number;
    salePrice: number;
    tags: ("BEST" | "NEW" | "SALE" | "TODAY_DEAL" | "ONLINE_ONLY" | "EDITOR_PICK" | "GLOBAL")[];
    salesChannels: ("GLOBAL" | "ONLINE" | "OFFLINE")[];
    status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";
    brandId: string;
    categoryId: string;
    volume?: string | undefined;
    skinType?: string[] | undefined;
}>, {
    name: string;
    description: string;
    shortDescription: string;
    originalPrice: number;
    salePrice: number;
    tags: ("BEST" | "NEW" | "SALE" | "TODAY_DEAL" | "ONLINE_ONLY" | "EDITOR_PICK" | "GLOBAL")[];
    salesChannels: ("GLOBAL" | "ONLINE" | "OFFLINE")[];
    status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";
    brandId: string;
    categoryId: string;
    volume?: string | undefined;
    skinType?: string[] | undefined;
}, {
    name: string;
    description: string;
    shortDescription: string;
    originalPrice: number;
    salePrice: number;
    tags: ("BEST" | "NEW" | "SALE" | "TODAY_DEAL" | "ONLINE_ONLY" | "EDITOR_PICK" | "GLOBAL")[];
    salesChannels: ("GLOBAL" | "ONLINE" | "OFFLINE")[];
    status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";
    brandId: string;
    categoryId: string;
    volume?: string | undefined;
    skinType?: string[] | undefined;
}>;
export type ProductFormData = z.infer<typeof ProductFormSchema>;
/** 회원 검색 쿼리 스키마 */
export declare const CustomerSearchSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    grade: z.ZodOptional<z.ZodEnum<["BRONZE", "SILVER", "GOLD", "PLATINUM"]>>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "DORMANT", "WITHDRAWN"]>>;
    joinChannel: z.ZodOptional<z.ZodEnum<["ONLINE", "OFFLINE", "APP", "GLOBAL"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    size: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    size: number;
    status?: "ACTIVE" | "DORMANT" | "WITHDRAWN" | undefined;
    query?: string | undefined;
    grade?: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | undefined;
    joinChannel?: "GLOBAL" | "ONLINE" | "OFFLINE" | "APP" | undefined;
}, {
    status?: "ACTIVE" | "DORMANT" | "WITHDRAWN" | undefined;
    query?: string | undefined;
    grade?: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | undefined;
    joinChannel?: "GLOBAL" | "ONLINE" | "OFFLINE" | "APP" | undefined;
    page?: number | undefined;
    size?: number | undefined;
}>;
export type CustomerSearchParams = z.infer<typeof CustomerSearchSchema>;
/** 주문 필터 스키마 */
export declare const OrderFilterSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED"]>>;
    search: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    paymentMethod: z.ZodOptional<z.ZodEnum<["CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "VIRTUAL_ACCOUNT", "KAKAO_PAY", "NAVER_PAY", "TOSS_PAY", "POINTS"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "PROCESSING" | "CANCELLED" | "REFUNDED" | "PARTIALLY_REFUNDED" | undefined;
    search?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    paymentMethod?: "CREDIT_CARD" | "DEBIT_CARD" | "BANK_TRANSFER" | "VIRTUAL_ACCOUNT" | "KAKAO_PAY" | "NAVER_PAY" | "TOSS_PAY" | "POINTS" | undefined;
}, {
    status?: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "PROCESSING" | "CANCELLED" | "REFUNDED" | "PARTIALLY_REFUNDED" | undefined;
    search?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    paymentMethod?: "CREDIT_CARD" | "DEBIT_CARD" | "BANK_TRANSFER" | "VIRTUAL_ACCOUNT" | "KAKAO_PAY" | "NAVER_PAY" | "TOSS_PAY" | "POINTS" | undefined;
}>;
export type OrderFilterParams = z.infer<typeof OrderFilterSchema>;
/** 정산 조회 스키마 */
export declare const SettlementQuerySchema: z.ZodObject<{
    period: z.ZodString;
    partnerId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "CALCULATED", "CONFIRMED", "PAID", "DISPUTED"]>>;
}, "strip", z.ZodTypeAny, {
    period: string;
    status?: "PENDING" | "CONFIRMED" | "CALCULATED" | "PAID" | "DISPUTED" | undefined;
    partnerId?: string | undefined;
}, {
    period: string;
    status?: "PENDING" | "CONFIRMED" | "CALCULATED" | "PAID" | "DISPUTED" | undefined;
    partnerId?: string | undefined;
}>;
export type SettlementQueryParams = z.infer<typeof SettlementQuerySchema>;
/** API 공통 에러 응답 스키마 */
export declare const ApiErrorSchema: z.ZodObject<{
    status: z.ZodNumber;
    message: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    status: number;
    message: string;
    code?: string | undefined;
    details?: Record<string, string[]> | undefined;
}, {
    status: number;
    message: string;
    code?: string | undefined;
    details?: Record<string, string[]> | undefined;
}>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
/** 페이지네이션 쿼리 스키마 */
export declare const PaginationQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    size: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    size: number;
}, {
    page?: number | undefined;
    size?: number | undefined;
}>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
