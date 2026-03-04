// ============================================================
// 세틀먼트 플랫폼 - 정산 도메인 모델
// ============================================================

/** 주문 상태 */
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

/** 결제 수단 */
export type PaymentMethod =
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "BANK_TRANSFER"
  | "VIRTUAL_ACCOUNT"
  | "KAKAO_PAY"
  | "NAVER_PAY"
  | "TOSS_PAY"
  | "POINTS";

/** 주문 항목 */
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  optionName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
}

/** 주문 */
export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  pointsUsed: number;
  couponDiscount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  deliveryType: string;
  shippingAddress: string;
  memo?: string;
  orderedAt: string;
  paidAt?: string;
  confirmedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

/** 정산 상태 */
export type SettlementStatus =
  | "PENDING"
  | "CALCULATED"
  | "CONFIRMED"
  | "PAID"
  | "DISPUTED";

/** 정산 내역 */
export interface Settlement {
  id: string;
  period: string; // e.g., "2026-02"
  partnerId: string;
  partnerName: string;
  totalSales: number;
  totalRefunds: number;
  commissionRate: number;
  commissionAmount: number;
  shippingFeeSettlement: number;
  promotionCostShare: number;
  netAmount: number;
  status: SettlementStatus;
  orderCount: number;
  refundCount: number;
  calculatedAt: string;
  paidAt?: string;
}

/** 매출 통계 */
export interface SalesStatistics {
  date: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  cancelRate: number;
  refundRate: number;
}

/** 카테고리별 매출 */
export interface CategorySales {
  categoryId: string;
  categoryName: string;
  sales: number;
  orders: number;
  percentage: number;
}

/** 대시보드 요약 */
export interface DashboardSummary {
  todaySales: number;
  todayOrders: number;
  todayNewCustomers: number;
  todayPageViews: number;
  salesGrowthRate: number;
  ordersGrowthRate: number;
  customersGrowthRate: number;
  pageViewsGrowthRate: number;
  monthlySales: SalesStatistics[];
  categoryBreakdown: CategorySales[];
  topProducts: {
    productId: string;
    productName: string;
    sales: number;
    orders: number;
  }[];
  recentOrders: Order[];
}
