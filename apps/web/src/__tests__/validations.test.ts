import {
  ProductFormSchema,
  CustomerSearchSchema,
  OrderFilterSchema,
  SettlementQuerySchema,
} from "@/lib/validations";

describe("Zod Validation Schemas", () => {
  describe("ProductFormSchema", () => {
    const validProduct = {
      name: "독도 토너",
      brandId: "br-1",
      categoryId: "cat-1-1",
      originalPrice: 18000,
      salePrice: 14400,
      description:
        "라운드랩의 독도 토너 상세 설명입니다. 피부 깊은 곳까지 수분을 채워줍니다.",
      shortDescription: "라운드랩 독도 토너",
      tags: ["BEST", "EDITOR_PICK"] as const,
      salesChannels: ["ONLINE", "OFFLINE"] as const,
      status: "ACTIVE" as const,
    };

    it("should validate a correct product", () => {
      const result = ProductFormSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
    });

    it("should reject empty product name", () => {
      const result = ProductFormSchema.safeParse({ ...validProduct, name: "" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("name");
      }
    });

    it("should reject salePrice higher than originalPrice", () => {
      const result = ProductFormSchema.safeParse({
        ...validProduct,
        salePrice: 20000,
        originalPrice: 18000,
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty sales channels", () => {
      const result = ProductFormSchema.safeParse({
        ...validProduct,
        salesChannels: [],
      });
      expect(result.success).toBe(false);
    });

    it("should reject negative price", () => {
      const result = ProductFormSchema.safeParse({
        ...validProduct,
        originalPrice: -100,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("CustomerSearchSchema", () => {
    it("should use defaults for missing fields", () => {
      const result = CustomerSearchSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.size).toBe(20);
      }
    });

    it("should validate grade enum", () => {
      const result = CustomerSearchSchema.safeParse({ grade: "INVALID_GRADE" });
      expect(result.success).toBe(false);
    });

    it("should accept valid grade", () => {
      const result = CustomerSearchSchema.safeParse({ grade: "PLATINUM" });
      expect(result.success).toBe(true);
    });
  });

  describe("OrderFilterSchema", () => {
    it("should accept empty filter", () => {
      const result = OrderFilterSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should validate status enum", () => {
      const result = OrderFilterSchema.safeParse({ status: "DELIVERED" });
      expect(result.success).toBe(true);
    });

    it("should reject invalid payment method", () => {
      const result = OrderFilterSchema.safeParse({
        paymentMethod: "BITCOIN",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("SettlementQuerySchema", () => {
    it("should validate correct period format", () => {
      const result = SettlementQuerySchema.safeParse({ period: "2026-02" });
      expect(result.success).toBe(true);
    });

    it("should reject incorrect period format", () => {
      const result = SettlementQuerySchema.safeParse({ period: "2026/02" });
      expect(result.success).toBe(false);
    });

    it("should reject missing period", () => {
      const result = SettlementQuerySchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
