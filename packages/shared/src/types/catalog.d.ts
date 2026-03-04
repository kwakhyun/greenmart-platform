/** 상품 카테고리 */
export interface Category {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    depth: number;
    sortOrder: number;
    imageUrl?: string;
    children?: Category[];
}
/** 브랜드 */
export interface Brand {
    id: string;
    name: string;
    nameEn: string;
    logoUrl: string;
    country: string;
    isOfficial: boolean;
    description: string;
}
/** 상품 옵션 (색상, 용량 등) */
export interface ProductOption {
    id: string;
    name: string;
    values: ProductOptionValue[];
}
export interface ProductOptionValue {
    id: string;
    label: string;
    additionalPrice: number;
    sku: string;
    stock: number;
}
/** 상품 이미지 */
export interface ProductImage {
    id: string;
    url: string;
    alt: string;
    sortOrder: number;
    type: "main" | "detail" | "thumbnail";
}
/** 상품 리뷰 요약 */
export interface ReviewSummary {
    averageRating: number;
    totalCount: number;
    distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}
/** 상품 태그 */
export type ProductTag = "BEST" | "NEW" | "SALE" | "TODAY_DEAL" | "ONLINE_ONLY" | "EDITOR_PICK" | "GLOBAL";
/** 판매 채널 */
export type SalesChannel = "ONLINE" | "OFFLINE" | "GLOBAL";
/** 상품 상태 */
export type ProductStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";
/** 상품 (카탈로그 핵심 엔티티) */
export interface Product {
    id: string;
    name: string;
    nameEn?: string;
    slug: string;
    brand: Brand;
    category: Category;
    description: string;
    shortDescription: string;
    originalPrice: number;
    salePrice: number;
    discountRate: number;
    images: ProductImage[];
    options: ProductOption[];
    tags: ProductTag[];
    salesChannels: SalesChannel[];
    status: ProductStatus;
    reviewSummary: ReviewSummary;
    ingredients?: string;
    volume?: string;
    skinType?: string[];
    createdAt: string;
    updatedAt: string;
}
/** 상품 목록 조회 필터 */
export interface ProductFilter {
    categoryId?: string;
    brandId?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: ProductTag[];
    channels?: SalesChannel[];
    status?: ProductStatus;
    search?: string;
    sortBy?: "latest" | "price_asc" | "price_desc" | "rating" | "reviews" | "sales";
}
/** 페이지네이션 */
export interface Pagination {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
}
/** 페이지네이션 응답 */
export interface PaginatedResponse<T> {
    items: T[];
    pagination: Pagination;
}
