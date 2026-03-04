import {
  formatCurrency,
  formatCompactNumber,
  formatPercent,
  formatDate,
  formatRelativeTime,
  getOrderStatusLabel,
  getDeliveryStatusLabel,
  getMemberGradeLabel,
  getPaymentMethodLabel,
  getSettlementStatusLabel,
  getStatusColor,
  cn,
} from "@/lib/utils";

describe("utils", () => {
  describe("cn (className merge)", () => {
    it("should merge class names correctly", () => {
      expect(cn("px-2", "py-1")).toBe("px-2 py-1");
    });

    it("should handle conditional classes", () => {
      expect(cn("base", false && "hidden", "visible")).toBe("base visible");
    });

    it("should resolve tailwind conflicts", () => {
      expect(cn("px-2", "px-4")).toBe("px-4");
    });
  });

  describe("formatCurrency", () => {
    it("should format number as KRW", () => {
      expect(formatCurrency(14400)).toBe("₩14,400");
    });

    it("should handle zero", () => {
      expect(formatCurrency(0)).toBe("₩0");
    });

    it("should handle large numbers", () => {
      expect(formatCurrency(1280000)).toBe("₩1,280,000");
    });
  });

  describe("formatCompactNumber", () => {
    it("should format number in 억 unit", () => {
      expect(formatCompactNumber(128450000)).toBe("1.3억");
    });

    it("should format number in 만 unit", () => {
      expect(formatCompactNumber(85420)).toBe("9만");
    });

    it("should format number in 천 unit", () => {
      expect(formatCompactNumber(1235)).toBe("1.2천");
    });

    it("should format small numbers with locale", () => {
      expect(formatCompactNumber(500)).toBe("500");
    });
  });

  describe("formatPercent", () => {
    it("should add + sign for positive values", () => {
      expect(formatPercent(12.5)).toBe("+12.5%");
    });

    it("should keep - sign for negative values", () => {
      expect(formatPercent(-3.2)).toBe("-3.2%");
    });

    it("should handle zero", () => {
      expect(formatPercent(0)).toBe("+0.0%");
    });
  });

  describe("formatDate", () => {
    it("should format ISO date string", () => {
      const result = formatDate("2026-03-03T10:00:00Z");
      expect(result).toContain("2026");
      expect(result).toContain("03");
    });
  });

  describe("Status label mappers", () => {
    it("should map order status to Korean", () => {
      expect(getOrderStatusLabel("PENDING")).toBe("결제 대기");
      expect(getOrderStatusLabel("DELIVERED")).toBe("배송 완료");
      expect(getOrderStatusLabel("CANCELLED")).toBe("주문 취소");
    });

    it("should map delivery status to Korean", () => {
      expect(getDeliveryStatusLabel("IN_TRANSIT")).toBe("배송 중");
      expect(getDeliveryStatusLabel("DELIVERED")).toBe("배송 완료");
    });

    it("should map member grade to Korean", () => {
      expect(getMemberGradeLabel("PLATINUM")).toBe("플래티넘");
      expect(getMemberGradeLabel("BRONZE")).toBe("브론즈");
    });

    it("should map payment method to Korean", () => {
      expect(getPaymentMethodLabel("KAKAO_PAY")).toBe("카카오페이");
      expect(getPaymentMethodLabel("CREDIT_CARD")).toBe("신용카드");
    });

    it("should map settlement status to Korean", () => {
      expect(getSettlementStatusLabel("PAID")).toBe("지급 완료");
      expect(getSettlementStatusLabel("PENDING")).toBe("대기");
    });

    it("should return original string for unknown status", () => {
      expect(getOrderStatusLabel("UNKNOWN")).toBe("UNKNOWN");
    });
  });

  describe("getStatusColor", () => {
    it("should return correct color classes for order statuses", () => {
      expect(getStatusColor("DELIVERED")).toContain("bg-green");
      expect(getStatusColor("CANCELLED")).toContain("bg-red");
      expect(getStatusColor("PENDING")).toContain("bg-yellow");
    });

    it("should return correct color classes for inventory statuses", () => {
      expect(getStatusColor("IN_STOCK")).toContain("bg-green");
      expect(getStatusColor("OUT_OF_STOCK")).toContain("bg-red");
      expect(getStatusColor("LOW_STOCK")).toContain("bg-orange");
    });

    it("should return default for unknown status", () => {
      expect(getStatusColor("SOMETHING_UNKNOWN")).toContain("bg-gray");
    });
  });
});
