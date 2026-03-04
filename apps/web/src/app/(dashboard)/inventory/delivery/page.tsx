"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import { useDeliveries } from "@/hooks";
import {
  cn,
  formatDate,
  formatDateTime,
  getDeliveryStatusLabel,
} from "@/lib/utils";
import { Truck, Globe, MapPin, Loader2, Filter, Package } from "lucide-react";
import { DELIVERY_TYPE_LABELS } from "@/lib/constants";

const statusSteps = [
  "PENDING",
  "CONFIRMED",
  "PICKING",
  "PACKING",
  "SHIPPED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

function getStepIndex(status: string): number {
  return statusSteps.indexOf(status);
}

export default function DeliveryPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const {
    data: deliveries,
    isLoading,
    isError,
    error,
  } = useDeliveries({
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  });

  const items = deliveries ?? [];

  return (
    <>
      <Header
        title="배송 관리"
        description="인벤토리 플랫폼 · Last-mile 최적 배송 서비스"
      />
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Filters */}
        <div className="card p-4 flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-40"
            aria-label="상태 필터"
          >
            <option value="">전체 상태</option>
            <option value="PENDING">대기</option>
            <option value="CONFIRMED">확인</option>
            <option value="PICKING">피킹</option>
            <option value="PACKING">포장</option>
            <option value="SHIPPED">출고</option>
            <option value="IN_TRANSIT">배송 중</option>
            <option value="OUT_FOR_DELIVERY">배달 중</option>
            <option value="DELIVERED">배송 완료</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field w-36"
            aria-label="배송 유형 필터"
          >
            <option value="">전체 유형</option>
            <option value="STANDARD">일반</option>
            <option value="EXPRESS">특급</option>
            <option value="DAWN">새벽</option>
            <option value="SAME_DAY">당일</option>
            <option value="GLOBAL">해외</option>
          </select>
          <span className="text-xs text-gray-500 ml-auto">
            총 {items.length}건
          </span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="card p-16 text-center">
            <Loader2 className="h-8 w-8 text-brand-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">
              배송 데이터를 불러오는 중...
            </p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="card p-16 text-center">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              데이터를 불러오지 못했습니다
            </h3>
            <p className="text-xs text-gray-500">
              {error instanceof Error
                ? error.message
                : "잠시 후 다시 시도해주세요."}
            </p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && items.length === 0 && (
          <div className="card p-16 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              배송 내역이 없습니다
            </h3>
            <p className="text-xs text-gray-500">다른 필터를 시도해보세요.</p>
          </div>
        )}

        {/* Delivery List */}
        {!isLoading && !isError && items.length > 0 && (
          <div className="space-y-4">
            {items.map((delivery) => {
              const currentStep = getStepIndex(delivery.status);
              const isGlobal = delivery.type === "GLOBAL";
              return (
                <article
                  key={delivery.id}
                  className="card overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "rounded-lg p-2",
                            isGlobal ? "bg-indigo-100" : "bg-blue-100",
                          )}
                        >
                          {isGlobal ? (
                            <Globe className="h-4 w-4 text-indigo-600" />
                          ) : (
                            <Truck className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-gray-900">
                              {delivery.id}
                            </h3>
                            <span className="badge bg-gray-100 text-gray-600">
                              {DELIVERY_TYPE_LABELS[delivery.type]}
                            </span>
                            <span
                              className={cn(
                                "badge",
                                delivery.status === "DELIVERED"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700",
                              )}
                            >
                              {getDeliveryStatusLabel(delivery.status)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            주문: {delivery.orderId} · {delivery.carrier}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <p>
                          배송예정: {formatDate(delivery.estimatedDeliveryDate)}
                        </p>
                        {delivery.trackingNumber && (
                          <p className="font-mono text-brand-primary">
                            {delivery.trackingNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center gap-4 text-xs flex-wrap">
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span className="font-medium text-gray-700">
                        {delivery.recipientName}
                      </span>
                    </div>
                    <span className="text-gray-400">
                      {delivery.recipientAddress}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-4">
                      {statusSteps.map((step, idx) => {
                        const isCompleted = idx <= currentStep;
                        const isCurrent = idx === currentStep;
                        return (
                          <div key={step} className="flex items-center flex-1">
                            <div
                              className={cn(
                                "h-2 w-2 rounded-full flex-shrink-0",
                                isCompleted
                                  ? "bg-brand-primary"
                                  : "bg-gray-200",
                                isCurrent &&
                                  "ring-2 ring-brand-primary/30 h-3 w-3",
                              )}
                            />
                            {idx < statusSteps.length - 1 && (
                              <div
                                className={cn(
                                  "h-0.5 flex-1 mx-0.5",
                                  isCompleted && idx < currentStep
                                    ? "bg-brand-primary"
                                    : "bg-gray-200",
                                )}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="space-y-2">
                      {[...delivery.timeline].reverse().map((event, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 text-xs"
                        >
                          <div
                            className={cn(
                              "mt-0.5 h-1.5 w-1.5 rounded-full flex-shrink-0",
                              idx === 0 ? "bg-brand-primary" : "bg-gray-300",
                            )}
                          />
                          <span className="text-gray-400 w-28 flex-shrink-0">
                            {formatDateTime(event.timestamp)}
                          </span>
                          <span className="text-gray-700">
                            {event.description}
                          </span>
                          {event.location && (
                            <span className="text-gray-400">
                              ({event.location})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
