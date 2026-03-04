import type { ProductTag } from "@/types/catalog";

// ============================================================
// 상품 태그 라벨 및 색상 매핑
// ============================================================

export const TAG_LABELS: Record<ProductTag, string> = {
  BEST: "BEST",
  NEW: "NEW",
  SALE: "SALE",
  TODAY_DEAL: "오늘의 특가",
  ONLINE_ONLY: "온라인 전용",
  EDITOR_PICK: "에디터 PICK",
  GLOBAL: "GLOBAL",
};

export const TAG_COLORS: Record<ProductTag, string> = {
  BEST: "bg-red-100 text-red-700",
  NEW: "bg-blue-100 text-blue-700",
  SALE: "bg-orange-100 text-orange-700",
  TODAY_DEAL: "bg-purple-100 text-purple-700",
  ONLINE_ONLY: "bg-cyan-100 text-cyan-700",
  EDITOR_PICK: "bg-green-100 text-green-700",
  GLOBAL: "bg-indigo-100 text-indigo-700",
};

// ============================================================
// 회원 등급 색상 매핑
// ============================================================

export const GRADE_COLORS: Record<string, string> = {
  BRONZE: "bg-gray-100 text-gray-700",
  SILVER: "bg-green-100 text-green-700",
  GOLD: "bg-yellow-100 text-yellow-800",
  PLATINUM: "bg-purple-100 text-purple-700",
};

// ============================================================
// 재고 상태 라벨
// ============================================================

export const STOCK_STATUS_LABELS: Record<string, string> = {
  IN_STOCK: "정상",
  LOW_STOCK: "부족",
  OUT_OF_STOCK: "품절",
  RESERVED: "예약",
};

// ============================================================
// 배송 타입 라벨
// ============================================================

export const DELIVERY_TYPE_LABELS: Record<string, string> = {
  STANDARD: "일반배송",
  EXPRESS: "익스프레스",
  SAME_DAY: "당일배송",
  PICKUP: "매장픽업",
  GLOBAL: "글로벌배송",
};
