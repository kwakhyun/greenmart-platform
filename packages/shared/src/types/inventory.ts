// ============================================================
// 인벤토리 플랫폼 - 물류/재고 도메인 모델
// ============================================================

/** 창고 */
export interface Warehouse {
  id: string;
  name: string;
  code: string;
  type: "MAIN" | "REGIONAL" | "STORE";
  address: string;
  capacity: number;
  currentUsage: number;
  isActive: boolean;
}

/** 재고 상태 */
export type StockStatus =
  | "IN_STOCK"
  | "LOW_STOCK"
  | "OUT_OF_STOCK"
  | "RESERVED";

/** 재고 항목 */
export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderPoint: number;
  status: StockStatus;
  lastUpdated: string;
}

/** 배송 상태 */
export type DeliveryStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PICKING"
  | "PACKING"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "RETURNED";

/** 배송 타입 */
export type DeliveryType =
  | "STANDARD"
  | "EXPRESS"
  | "SAME_DAY"
  | "PICKUP"
  | "GLOBAL";

/** 배송 */
export interface Delivery {
  id: string;
  orderId: string;
  type: DeliveryType;
  status: DeliveryStatus;
  trackingNumber?: string;
  carrier: string;
  senderWarehouse: string;
  recipientName: string;
  recipientAddress: string;
  recipientPhone: string;
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  timeline: DeliveryTimeline[];
}

/** 배송 타임라인 */
export interface DeliveryTimeline {
  status: DeliveryStatus;
  timestamp: string;
  location?: string;
  description: string;
}

/** 재고 이동 */
export interface StockMovement {
  id: string;
  type: "INBOUND" | "OUTBOUND" | "TRANSFER" | "ADJUSTMENT";
  productId: string;
  productName: string;
  sku: string;
  fromWarehouse?: string;
  toWarehouse?: string;
  quantity: number;
  reason: string;
  createdAt: string;
  createdBy: string;
}
