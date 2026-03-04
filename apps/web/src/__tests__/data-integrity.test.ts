import { products, categories, brands } from "@/data/catalog";
import {
  customers,
  coupons,
  promotions,
  customerVoices,
} from "@/data/customer";
import {
  warehouses,
  inventoryItems,
  deliveries,
  stockMovements,
} from "@/data/inventory";
import { orders, settlements, dashboardSummary } from "@/data/settlement";

describe("Mock Data Integrity", () => {
  describe("Catalog Data", () => {
    it("should have products with valid brands", () => {
      products.forEach((p) => {
        expect(p.brand).toBeDefined();
        expect(p.brand.id).toBeTruthy();
        expect(p.brand.name).toBeTruthy();
      });
    });

    it("should have products with valid categories", () => {
      products.forEach((p) => {
        expect(p.category).toBeDefined();
        expect(p.category.id).toBeTruthy();
      });
    });

    it("should have consistent discount rates", () => {
      products.forEach((p) => {
        if (p.discountRate > 0) {
          expect(p.salePrice).toBeLessThan(p.originalPrice);
        }
        if (p.salePrice === p.originalPrice) {
          expect(p.discountRate).toBe(0);
        }
      });
    });

    it("should have valid review data", () => {
      products.forEach((p) => {
        expect(p.reviewSummary.averageRating).toBeGreaterThanOrEqual(0);
        expect(p.reviewSummary.averageRating).toBeLessThanOrEqual(5);
        expect(p.reviewSummary.totalCount).toBeGreaterThan(0);
      });
    });

    it("should have at least 10 products", () => {
      expect(products.length).toBeGreaterThanOrEqual(10);
    });

    it("should have hierarchical categories", () => {
      const parentCategories = categories.filter((c) => c.parentId === null);
      expect(parentCategories.length).toBeGreaterThan(0);
      const hasChildren = parentCategories.some(
        (c) => c.children && c.children.length > 0,
      );
      expect(hasChildren).toBe(true);
    });
  });

  describe("Customer Data", () => {
    it("should have all grade types", () => {
      const grades = new Set(customers.map((c) => c.grade));
      expect(grades).toContain("BRONZE");
      expect(grades).toContain("SILVER");
      expect(grades).toContain("GOLD");
      expect(grades).toContain("PLATINUM");
    });

    it("should have consistent purchase data", () => {
      customers.forEach((c) => {
        if (c.totalOrders > 0) {
          expect(c.totalPurchaseAmount).toBeGreaterThan(0);
        }
      });
    });

    it("should have valid coupon data", () => {
      coupons.forEach((cpn) => {
        expect(cpn.code).toBeTruthy();
        expect(cpn.value).toBeGreaterThanOrEqual(0);
      });
    });

    it("should have valid VOC data", () => {
      customerVoices.forEach((v) => {
        expect(v.customerName).toBeTruthy();
        expect(v.title).toBeTruthy();
        expect(["INQUIRY", "COMPLAINT", "SUGGESTION", "COMPLIMENT"]).toContain(
          v.type,
        );
      });
    });
  });

  describe("Inventory Data", () => {
    it("should have available = total - reserved", () => {
      inventoryItems.forEach((item) => {
        expect(item.availableQuantity).toBe(
          item.quantity - item.reservedQuantity,
        );
      });
    });

    it("should have consistent stock status", () => {
      inventoryItems.forEach((item) => {
        if (item.quantity === 0) {
          expect(item.status).toBe("OUT_OF_STOCK");
        }
      });
    });

    it("should have warehouse capacity >= usage", () => {
      warehouses.forEach((wh) => {
        expect(wh.capacity).toBeGreaterThanOrEqual(wh.currentUsage);
      });
    });

    it("should have delivery timelines in order", () => {
      deliveries.forEach((d) => {
        for (let i = 1; i < d.timeline.length; i++) {
          const prev = new Date(d.timeline[i - 1].timestamp).getTime();
          const curr = new Date(d.timeline[i].timestamp).getTime();
          expect(curr).toBeGreaterThanOrEqual(prev);
        }
      });
    });
  });

  describe("Settlement Data", () => {
    it("should have valid order totals", () => {
      orders.forEach((o) => {
        expect(o.totalAmount).toBeGreaterThan(0);
        expect(o.items.length).toBeGreaterThan(0);
      });
    });

    it("should have net = sales - refunds - commission - shipping - promo", () => {
      settlements.forEach((s) => {
        const calculated =
          s.totalSales -
          s.totalRefunds -
          s.commissionAmount -
          s.shippingFeeSettlement -
          s.promotionCostShare;
        // Allow 1원 rounding difference
        expect(Math.abs(s.netAmount - calculated)).toBeLessThanOrEqual(1);
      });
    });

    it("should have valid dashboard summary", () => {
      expect(dashboardSummary.todaySales).toBeGreaterThan(0);
      expect(dashboardSummary.monthlySales.length).toBeGreaterThan(0);
      expect(dashboardSummary.categoryBreakdown.length).toBeGreaterThan(0);
      expect(dashboardSummary.topProducts.length).toBe(5);
    });
  });
});
