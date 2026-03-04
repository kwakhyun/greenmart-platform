import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind CSS 클래스 병합 유틸리티 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 숫자를 한국 원화 형식으로 포맷 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** 숫자를 간단한 형태로 포맷 (예: 1.2억, 3.4만) */
export function formatCompactNumber(num: number): string {
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(1)}억`;
  }
  if (num >= 10000) {
    return `${(num / 10000).toFixed(0)}만`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}천`;
  }
  return num.toLocaleString("ko-KR");
}

/** 퍼센트 포맷 */
export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

/** 날짜 포맷 (YYYY-MM-DD) */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/** 날짜+시간 포맷 */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 상대 시간 (n분 전, n시간 전) */
export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 30) return `${days}일 전`;
  return formatDate(dateStr);
}

/** 별점 표시 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/** 할인율 배지 텍스트 */
export function formatDiscount(rate: number): string {
  return `${rate}%`;
}

/** 주문 상태 한글 매핑 */
export function getOrderStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: "결제 대기",
    CONFIRMED: "주문 확인",
    PROCESSING: "처리 중",
    SHIPPED: "배송 중",
    DELIVERED: "배송 완료",
    CANCELLED: "주문 취소",
    REFUNDED: "환불 완료",
    PARTIALLY_REFUNDED: "부분 환불",
  };
  return map[status] ?? status;
}

/** 배송 상태 한글 매핑 */
export function getDeliveryStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: "접수 대기",
    CONFIRMED: "주문 확인",
    PICKING: "피킹 중",
    PACKING: "포장 중",
    SHIPPED: "출고 완료",
    IN_TRANSIT: "배송 중",
    OUT_FOR_DELIVERY: "배송 출발",
    DELIVERED: "배송 완료",
    RETURNED: "반송",
  };
  return map[status] ?? status;
}

/** 회원 등급 한글 매핑 */
export function getMemberGradeLabel(grade: string): string {
  const map: Record<string, string> = {
    BRONZE: "브론즈",
    SILVER: "실버",
    GOLD: "골드",
    PLATINUM: "플래티넘",
  };
  return map[grade] ?? grade;
}

/** 결제 수단 한글 매핑 */
export function getPaymentMethodLabel(method: string): string {
  const map: Record<string, string> = {
    CREDIT_CARD: "신용카드",
    DEBIT_CARD: "체크카드",
    BANK_TRANSFER: "계좌이체",
    VIRTUAL_ACCOUNT: "가상계좌",
    KAKAO_PAY: "카카오페이",
    NAVER_PAY: "네이버페이",
    TOSS_PAY: "토스페이",
    POINTS: "포인트",
  };
  return map[method] ?? method;
}

/** 정산 상태 한글 매핑 */
export function getSettlementStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: "대기",
    CALCULATED: "산출 완료",
    CONFIRMED: "확정",
    PAID: "지급 완료",
    DISPUTED: "이의 제기",
  };
  return map[status] ?? status;
}

/** 상태별 색상 클래스 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    // 주문
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-indigo-100 text-indigo-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    REFUNDED: "bg-gray-100 text-gray-800",
    // 재고
    IN_STOCK: "bg-green-100 text-green-800",
    LOW_STOCK: "bg-orange-100 text-orange-800",
    OUT_OF_STOCK: "bg-red-100 text-red-800",
    // 정산
    CALCULATED: "bg-blue-100 text-blue-800",
    PAID: "bg-green-100 text-green-800",
    DISPUTED: "bg-red-100 text-red-800",
    // 회원
    ACTIVE: "bg-green-100 text-green-800",
    DORMANT: "bg-gray-100 text-gray-800",
    WITHDRAWN: "bg-red-100 text-red-800",
    // VOC
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    RESOLVED: "bg-green-100 text-green-800",
    CLOSED: "bg-gray-100 text-gray-800",
  };
  return colorMap[status] ?? "bg-gray-100 text-gray-800";
}
