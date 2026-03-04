"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { useOrder, useUpdateOrderStatus } from "@/hooks";
import type { OrderStatus } from "@/types";
import {
  cn,
  formatCurrency,
  formatDateTime,
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getStatusColor,
} from "@/lib/utils";
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  CreditCard,
  MapPin,
  User,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Truck,
  FileText,
} from "lucide-react";
import { useState } from "react";

const STATUS_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = typeof params.id === "string" ? params.id : "";
  const { data: order, isLoading, isError } = useOrder(orderId);
  const updateStatus = useUpdateOrderStatus();
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleStatusChange(newStatus: OrderStatus) {
    try {
      await updateStatus.mutateAsync({ id: orderId, status: newStatus });
      showToast(
        `주문 상태가 "${getOrderStatusLabel(newStatus)}"(으)로 변경되었습니다.`,
      );
    } catch {
      showToast("상태 변경에 실패했습니다.");
    }
  }

  if (isLoading) {
    return (
      <>
        <Header title="주문 관리" description="세틀먼트 플랫폼" />
        <div className="p-6">
          <div className="card p-16 text-center">
            <Loader2 className="h-8 w-8 text-brand-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">주문 정보를 불러오는 중...</p>
          </div>
        </div>
      </>
    );
  }

  if (isError || !order) {
    return (
      <>
        <Header title="주문 관리" description="세틀먼트 플랫폼" />
        <div className="p-6">
          <div className="card p-16 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              주문을 찾을 수 없습니다
            </h2>
            <Link
              href="/settlement/orders"
              className="btn-primary mt-4 inline-block"
            >
              주문 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </>
    );
  }

  const isCancelledOrRefunded = [
    "CANCELLED",
    "REFUNDED",
    "PARTIALLY_REFUNDED",
  ].includes(order.status);
  const currentStepIndex = STATUS_FLOW.indexOf(order.status as OrderStatus);

  return (
    <>
      <Header
        title="주문 상세"
        description={`세틀먼트 플랫폼 · ${order.orderNumber}`}
      />
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Toast */}
        {toast && (
          <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm animate-fade-in">
            {toast}
          </div>
        )}

        {/* Back */}
        <Link
          href="/settlement/orders"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          주문 목록
        </Link>

        {/* Order Header */}
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-gray-900">
                  {order.orderNumber}
                </h1>
                <span
                  className={cn("badge text-sm", getStatusColor(order.status))}
                >
                  {getOrderStatusLabel(order.status)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDateTime(order.orderedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {order.customerName}
                </span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {!isCancelledOrRefunded && order.status !== "DELIVERED" && (
                <>
                  {order.status === "PENDING" && (
                    <button
                      onClick={() => handleStatusChange("CONFIRMED")}
                      disabled={updateStatus.isPending}
                      className="btn-primary text-sm"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      주문 확인
                    </button>
                  )}
                  {order.status === "CONFIRMED" && (
                    <button
                      onClick={() => handleStatusChange("PROCESSING")}
                      disabled={updateStatus.isPending}
                      className="btn-primary text-sm"
                    >
                      <Package className="h-4 w-4 mr-1" />
                      처리 시작
                    </button>
                  )}
                  {order.status === "PROCESSING" && (
                    <button
                      onClick={() => handleStatusChange("SHIPPED")}
                      disabled={updateStatus.isPending}
                      className="btn-primary text-sm"
                    >
                      <Truck className="h-4 w-4 mr-1" />
                      출고 처리
                    </button>
                  )}
                  {order.status === "SHIPPED" && (
                    <button
                      onClick={() => handleStatusChange("DELIVERED")}
                      disabled={updateStatus.isPending}
                      className="btn-primary text-sm"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      배송 완료
                    </button>
                  )}
                </>
              )}
              {!isCancelledOrRefunded && order.status !== "DELIVERED" && (
                <button
                  onClick={() => handleStatusChange("CANCELLED")}
                  disabled={updateStatus.isPending}
                  className="px-3 py-1.5 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <XCircle className="h-4 w-4 mr-1 inline" />
                  주문 취소
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Stepper (for normal flow) */}
        {!isCancelledOrRefunded && (
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              주문 진행 상태
            </h3>
            <div className="flex items-center justify-between">
              {STATUS_FLOW.map((step, idx) => {
                const isCompleted = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;
                return (
                  <div
                    key={step}
                    className="flex items-center flex-1 last:flex-none"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                          isCompleted
                            ? "bg-brand-primary border-brand-primary text-white"
                            : "bg-white border-gray-200 text-gray-400",
                          isCurrent && "ring-4 ring-brand-primary/20",
                        )}
                      >
                        {isCompleted ? "✓" : idx + 1}
                      </div>
                      <span
                        className={cn(
                          "text-[10px] mt-1 font-medium",
                          isCompleted ? "text-brand-primary" : "text-gray-400",
                        )}
                      >
                        {getOrderStatusLabel(step)}
                      </span>
                    </div>
                    {idx < STATUS_FLOW.length - 1 && (
                      <div
                        className={cn(
                          "flex-1 h-0.5 mx-2",
                          currentStepIndex > idx
                            ? "bg-brand-primary"
                            : "bg-gray-200",
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-400" />
            주문 상품 ({order.items.length}건)
          </h3>
          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="h-14 w-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.productImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="h-6 w-6 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.productName}
                  </p>
                  {item.optionName && (
                    <p className="text-xs text-gray-400">{item.optionName}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {formatCurrency(item.unitPrice)} × {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  {item.discountAmount > 0 && (
                    <p className="text-xs text-red-500 line-through">
                      {formatCurrency(item.totalPrice)}
                    </p>
                  )}
                  <p className="text-sm font-bold text-gray-900">
                    {formatCurrency(item.finalPrice)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment & Delivery Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Summary */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-400" />
              결제 정보
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">결제 수단</span>
                <span className="font-medium">
                  {getPaymentMethodLabel(order.paymentMethod)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">상품 금액</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">배송비</span>
                <span>
                  {order.shippingFee === 0
                    ? "무료"
                    : formatCurrency(order.shippingFee)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>할인</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              {order.pointsUsed > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>포인트 사용</span>
                  <span>-{formatCurrency(order.pointsUsed)}</span>
                </div>
              )}
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>쿠폰 할인</span>
                  <span>-{formatCurrency(order.couponDiscount)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between font-bold">
                <span className="text-gray-900">총 결제 금액</span>
                <span className="text-brand-primary text-lg">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              배송 정보
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">주문자</span>
                <span className="font-medium">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">배송 유형</span>
                <span>{order.deliveryType}</span>
              </div>
              <div>
                <span className="text-gray-500">배송 주소</span>
                <p className="mt-1 text-gray-900 bg-gray-50 p-2.5 rounded-lg text-xs">
                  {order.shippingAddress}
                </p>
              </div>
              {order.memo && (
                <div>
                  <span className="text-gray-500 flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    배송 메모
                  </span>
                  <p className="mt-1 text-gray-900 bg-gray-50 p-2.5 rounded-lg text-xs">
                    {order.memo}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            주문 이력
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">주문일</span>
              <span>{formatDateTime(order.orderedAt)}</span>
            </div>
            {order.paidAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">결제일</span>
                <span>{formatDateTime(order.paidAt)}</span>
              </div>
            )}
            {order.confirmedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">확인일</span>
                <span>{formatDateTime(order.confirmedAt)}</span>
              </div>
            )}
            {order.deliveredAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">배송 완료일</span>
                <span>{formatDateTime(order.deliveredAt)}</span>
              </div>
            )}
            {order.cancelledAt && (
              <div className="flex justify-between text-red-500">
                <span>취소일</span>
                <span>{formatDateTime(order.cancelledAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
