"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { useDelivery } from "@/hooks";
import {
  cn,
  formatDateTime,
  getDeliveryStatusLabel,
  getStatusColor,
} from "@/lib/utils";
import { DELIVERY_TYPE_LABELS } from "@/lib/constants";
import {
  ArrowLeft,
  Truck,
  Package,
  MapPin,
  Phone,
  User,
  Clock,
  Loader2,
  Warehouse,
  Navigation,
  CheckCircle2,
  Circle,
} from "lucide-react";

const STATUS_FLOW = [
  "PENDING",
  "CONFIRMED",
  "PICKING",
  "PACKING",
  "SHIPPED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export default function DeliveryDetailPage() {
  const params = useParams();
  const deliveryId = typeof params.id === "string" ? params.id : "";
  const { data: delivery, isLoading, isError } = useDelivery(deliveryId);

  if (isLoading) {
    return (
      <>
        <Header title="배송 관리" description="인벤토리 플랫폼" />
        <div className="p-6">
          <div className="card p-16 text-center">
            <Loader2 className="h-8 w-8 text-brand-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">배송 정보를 불러오는 중...</p>
          </div>
        </div>
      </>
    );
  }

  if (isError || !delivery) {
    return (
      <>
        <Header title="배송 관리" description="인벤토리 플랫폼" />
        <div className="p-6">
          <div className="card p-16 text-center">
            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              배송 정보를 찾을 수 없습니다
            </h2>
            <Link
              href="/inventory/delivery"
              className="btn-primary mt-4 inline-block"
            >
              배송 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </>
    );
  }

  const currentStepIndex = STATUS_FLOW.indexOf(delivery.status);
  const isReturned = delivery.status === "RETURNED";

  return (
    <>
      <Header
        title="배송 상세"
        description={`인벤토리 플랫폼 · ${delivery.trackingNumber || delivery.id}`}
      />
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Back */}
        <Link
          href="/inventory/delivery"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          배송 목록
        </Link>

        {/* Delivery Header */}
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-gray-900">
                  {delivery.trackingNumber || "운송장 미발급"}
                </h1>
                <span
                  className={cn(
                    "badge text-sm",
                    getStatusColor(delivery.status),
                  )}
                >
                  {getDeliveryStatusLabel(delivery.status)}
                </span>
                {isReturned && (
                  <span className="badge bg-red-100 text-red-700 text-sm">
                    반송
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  주문 {delivery.orderId}
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" />
                  {delivery.carrier}
                </span>
                <span className="badge bg-gray-100 text-gray-700 text-xs">
                  {DELIVERY_TYPE_LABELS[delivery.type] || delivery.type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Stepper */}
        {!isReturned && (
          <div className="card p-6 overflow-x-auto">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              배송 진행 상태
            </h3>
            <div className="flex items-center min-w-[600px]">
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
                          "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all",
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
                          "text-[9px] mt-1 font-medium whitespace-nowrap",
                          isCompleted ? "text-brand-primary" : "text-gray-400",
                        )}
                      >
                        {getDeliveryStatusLabel(step)}
                      </span>
                    </div>
                    {idx < STATUS_FLOW.length - 1 && (
                      <div
                        className={cn(
                          "flex-1 h-0.5 mx-1",
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">택배사</span>
              <div className="rounded-lg p-2 bg-blue-100">
                <Truck className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <span className="text-lg font-bold text-gray-900">
              {delivery.carrier}
            </span>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                배송 유형
              </span>
              <div className="rounded-lg p-2 bg-purple-100">
                <Navigation className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <span className="text-lg font-bold text-gray-900">
              {DELIVERY_TYPE_LABELS[delivery.type] || delivery.type}
            </span>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                예상 배송일
              </span>
              <div className="rounded-lg p-2 bg-green-100">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {formatDateTime(delivery.estimatedDeliveryDate)}
            </span>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                실제 배송일
              </span>
              <div className="rounded-lg p-2 bg-orange-100">
                <CheckCircle2 className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {delivery.actualDeliveryDate
                ? formatDateTime(delivery.actualDeliveryDate)
                : "-"}
            </span>
          </div>
        </div>

        {/* Shipping & Recipient Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recipient */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              수취인 정보
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">이름</span>
                <span className="font-medium">{delivery.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">연락처</span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  {delivery.recipientPhone}
                </span>
              </div>
              <div>
                <span className="text-gray-500">배송 주소</span>
                <p className="mt-1 text-gray-900 bg-gray-50 p-2.5 rounded-lg text-xs flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  {delivery.recipientAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Sender / Warehouse */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Warehouse className="h-4 w-4 text-gray-400" />
              발송 정보
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">발송 창고</span>
                <span className="font-medium">{delivery.senderWarehouse}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">운송장 번호</span>
                <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded">
                  {delivery.trackingNumber || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">주문 ID</span>
                <Link
                  href={`/settlement/orders/${delivery.orderId}`}
                  className="text-brand-primary hover:underline text-xs"
                >
                  {delivery.orderId}
                </Link>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">등록일</span>
                <span>{formatDateTime(delivery.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {delivery.timeline && delivery.timeline.length > 0 && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              배송 이력
            </h3>
            <div className="relative pl-6">
              {/* vertical line */}
              <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-200" />

              <div className="space-y-4">
                {delivery.timeline.map((event, idx) => {
                  const isLatest = idx === delivery.timeline.length - 1;
                  return (
                    <div key={idx} className="relative flex items-start gap-3">
                      <div className="absolute -left-6">
                        {isLatest ? (
                          <CheckCircle2 className="h-[18px] w-[18px] text-brand-primary" />
                        ) : (
                          <Circle className="h-[18px] w-[18px] text-gray-300 fill-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isLatest ? "text-brand-primary" : "text-gray-700",
                            )}
                          >
                            {getDeliveryStatusLabel(event.status)}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {formatDateTime(event.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {event.description}
                        </p>
                        {event.location && (
                          <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            일시 정보
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">생성일</span>
              <span>{formatDateTime(delivery.createdAt)}</span>
            </div>
            {delivery.shippedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">출고일</span>
                <span>{formatDateTime(delivery.shippedAt)}</span>
              </div>
            )}
            {delivery.deliveredAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">배송 완료일</span>
                <span>{formatDateTime(delivery.deliveredAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
