import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "GreenMart Core Platform API",
      version: "1.0.0",
      description:
        "헬스&뷰티 이커머스 코어 플랫폼 - 카탈로그 · 커스터머 · 인벤토리 · 세틀먼트 API 문서",
      contact: {
        name: "GreenMart Dev Team",
      },
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local Development",
      },
    ],
    tags: [
      { name: "Health", description: "헬스 체크" },
      { name: "Catalog", description: "상품/카테고리/브랜드 관리" },
      { name: "Customer", description: "회원/프로모션/VOC 관리" },
      { name: "Inventory", description: "재고/배송/창고 관리" },
      { name: "Settlement", description: "주문/정산/대시보드" },
    ],
    components: {
      schemas: {
        Pagination: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            size: { type: "integer", example: 12 },
            totalItems: { type: "integer", example: 100 },
            totalPages: { type: "integer", example: 9 },
          },
        },
        ApiError: {
          type: "object",
          properties: {
            status: { type: "integer", example: 400 },
            message: { type: "string", example: "유효성 검증에 실패했습니다." },
            code: { type: "string", example: "VALIDATION_ERROR" },
            details: {
              type: "object",
              additionalProperties: {
                type: "array",
                items: { type: "string" },
              },
            },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "string", example: "prod-1" },
            name: { type: "string", example: "독도 토너" },
            slug: { type: "string", example: "dokdo-toner" },
            brand: { $ref: "#/components/schemas/Brand" },
            category: { $ref: "#/components/schemas/Category" },
            description: { type: "string" },
            shortDescription: { type: "string" },
            originalPrice: { type: "number", example: 18000 },
            salePrice: { type: "number", example: 14400 },
            discountRate: { type: "integer", example: 20 },
            status: {
              type: "string",
              enum: ["ACTIVE", "INACTIVE", "OUT_OF_STOCK", "DISCONTINUED"],
            },
            tags: {
              type: "array",
              items: { type: "string" },
            },
            salesChannels: {
              type: "array",
              items: { type: "string", enum: ["ONLINE", "OFFLINE", "GLOBAL"] },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Brand: {
          type: "object",
          properties: {
            id: { type: "string", example: "br-1" },
            name: { type: "string", example: "라운드랩" },
            nameEn: { type: "string", example: "Round Lab" },
            country: { type: "string", example: "한국" },
            isOfficial: { type: "boolean" },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "string", example: "cat-1" },
            name: { type: "string", example: "스킨케어" },
            slug: { type: "string" },
            parentId: { type: "string", nullable: true },
            depth: { type: "integer" },
            children: {
              type: "array",
              items: { $ref: "#/components/schemas/Category" },
            },
          },
        },
      },
    },
  },
  apis: ["./src/docs/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
