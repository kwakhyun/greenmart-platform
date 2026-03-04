import request from "supertest";
import { createApp } from "../app";
import type { Express } from "express";

interface ProductResponse {
  id: string;
  name: string;
  brand: { name: string };
  category: { id: string };
  salePrice: number;
  status: string;
}

interface CustomerResponse {
  id: string;
  grade: string;
}

interface InventoryItemResponse {
  id: string;
  status: string;
}

interface OrderResponse {
  id: string;
  status: string;
}

let app: Express;

beforeAll(() => {
  app = createApp();
});

describe("Health Check", () => {
  it("GET /api/health should return ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body).toHaveProperty("timestamp");
    expect(res.body).toHaveProperty("uptime");
  });
});

describe("Catalog API", () => {
  describe("GET /api/catalog/products", () => {
    it("should return paginated products", async () => {
      const res = await request(app).get("/api/catalog/products");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("items");
      expect(res.body).toHaveProperty("pagination");
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.pagination).toHaveProperty("totalItems");
    });

    it("should filter products by search query", async () => {
      const res = await request(app).get("/api/catalog/products?search=독도");
      expect(res.status).toBe(200);
      expect(res.body.items.length).toBeGreaterThan(0);
      res.body.items.forEach((p: ProductResponse) => {
        const matchesSearch =
          p.name.includes("독도") || p.brand.name.includes("독도");
        expect(matchesSearch).toBe(true);
      });
    });

    it("should filter products by category", async () => {
      const res = await request(app).get(
        "/api/catalog/products?categoryId=cat-1-2",
      );
      expect(res.status).toBe(200);
      res.body.items.forEach((p: ProductResponse) => {
        expect(p.category.id).toBe("cat-1-2");
      });
    });

    it("should sort products by price ascending", async () => {
      const res = await request(app).get(
        "/api/catalog/products?sortBy=price_asc",
      );
      expect(res.status).toBe(200);
      const prices = res.body.items.map((p: ProductResponse) => p.salePrice);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
      }
    });

    it("should paginate correctly", async () => {
      const res = await request(app).get("/api/catalog/products?page=1&size=3");
      expect(res.status).toBe(200);
      expect(res.body.items.length).toBeLessThanOrEqual(3);
      expect(res.body.pagination.size).toBe(3);
    });
  });

  describe("GET /api/catalog/products/:id", () => {
    it("should return a product by id", async () => {
      const res = await request(app).get("/api/catalog/products/prod-1");
      expect(res.status).toBe(200);
      expect(res.body.id).toBe("prod-1");
      expect(res.body.name).toBe("독도 토너");
    });

    it("should return 404 for unknown product", async () => {
      const res = await request(app).get("/api/catalog/products/unknown-id");
      expect(res.status).toBe(404);
      expect(res.body.code).toBe("PRODUCT_NOT_FOUND");
    });
  });

  describe("POST /api/catalog/products", () => {
    it("should create a new product", async () => {
      const res = await request(app)
        .post("/api/catalog/products")
        .send({
          name: "테스트 세럼",
          brandId: "br-1",
          categoryId: "cat-1-3",
          originalPrice: 30000,
          salePrice: 24000,
          description: "테스트용 세럼 상품 설명입니다. 충분히 긴 설명.",
          shortDescription: "테스트 세럼",
          tags: ["NEW"],
          salesChannels: ["ONLINE"],
          status: "ACTIVE",
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.name).toBe("테스트 세럼");
    });

    it("should validate required fields", async () => {
      const res = await request(app)
        .post("/api/catalog/products")
        .send({ name: "" });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_ERROR");
    });

    it("should reject salePrice > originalPrice", async () => {
      const res = await request(app)
        .post("/api/catalog/products")
        .send({
          name: "잘못된 상품",
          brandId: "br-1",
          categoryId: "cat-1-3",
          originalPrice: 10000,
          salePrice: 20000,
          description: "할인가가 정가보다 비싼 잘못된 상품",
          shortDescription: "잘못된 상품",
          tags: [],
          salesChannels: ["ONLINE"],
          status: "ACTIVE",
        });
      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/catalog/products/:id", () => {
    it("should delete a product", async () => {
      const res = await request(app).delete("/api/catalog/products/prod-12");
      expect(res.status).toBe(200);
      expect(res.body.message).toContain("삭제");

      const getRes = await request(app).get("/api/catalog/products/prod-12");
      expect(getRes.status).toBe(404);
    });
  });

  describe("GET /api/catalog/categories", () => {
    it("should return categories", async () => {
      const res = await request(app).get("/api/catalog/categories");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/catalog/brands", () => {
    it("should return brands", async () => {
      const res = await request(app).get("/api/catalog/brands");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
});

describe("Customer API", () => {
  describe("GET /api/customer/members", () => {
    it("should return members with summary", async () => {
      const res = await request(app).get("/api/customer/members");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("items");
      expect(res.body).toHaveProperty("summary");
      expect(res.body.summary).toHaveProperty("PLATINUM");
    });

    it("should filter by grade", async () => {
      const res = await request(app).get(
        "/api/customer/members?grade=PLATINUM",
      );
      expect(res.status).toBe(200);
      res.body.items.forEach((c: CustomerResponse) => {
        expect(c.grade).toBe("PLATINUM");
      });
    });
  });

  describe("GET /api/customer/voc", () => {
    it("should return VOC items with summary", async () => {
      const res = await request(app).get("/api/customer/voc");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("items");
      expect(res.body).toHaveProperty("summary");
    });
  });
});

describe("Inventory API", () => {
  describe("GET /api/inventory/stock", () => {
    it("should return stock with summary", async () => {
      const res = await request(app).get("/api/inventory/stock");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("items");
      expect(res.body).toHaveProperty("summary");
    });

    it("should filter by status", async () => {
      const res = await request(app).get(
        "/api/inventory/stock?status=LOW_STOCK",
      );
      expect(res.status).toBe(200);
      res.body.items.forEach((i: InventoryItemResponse) => {
        expect(i.status).toBe("LOW_STOCK");
      });
    });
  });

  describe("GET /api/inventory/deliveries", () => {
    it("should return deliveries", async () => {
      const res = await request(app).get("/api/inventory/deliveries");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});

describe("Settlement API", () => {
  describe("GET /api/settlement/orders", () => {
    it("should return orders with statusCounts", async () => {
      const res = await request(app).get("/api/settlement/orders");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("items");
      expect(res.body).toHaveProperty("statusCounts");
    });

    it("should filter by status", async () => {
      const res = await request(app).get(
        "/api/settlement/orders?status=DELIVERED",
      );
      expect(res.status).toBe(200);
      res.body.items.forEach((o: OrderResponse) => {
        expect(o.status).toBe("DELIVERED");
      });
    });
  });

  describe("GET /api/settlement/settlements", () => {
    it("should return settlements with summary", async () => {
      const res = await request(app).get("/api/settlement/settlements");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("items");
      expect(res.body).toHaveProperty("summary");
      expect(res.body.summary).toHaveProperty("totalNet");
    });
  });

  describe("GET /api/settlement/dashboard", () => {
    it("should return dashboard summary", async () => {
      const res = await request(app).get("/api/settlement/dashboard");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("todaySales");
      expect(res.body).toHaveProperty("monthlySales");
      expect(res.body).toHaveProperty("topProducts");
    });
  });
});

describe("Error Handling", () => {
  it("should return 404 for unknown routes", async () => {
    const res = await request(app).get("/api/unknown");
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("NOT_FOUND");
  });
});
