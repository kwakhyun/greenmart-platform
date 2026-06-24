"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import {
  useOrders,
  useOrderRequests,
  useRetryOrderRequestWebhooks,
  useUpdateOrderRequestStatus,
  useDebounce,
} from "@/hooks";
import {
  cn,
  formatCurrency,
  formatDateTime,
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getStatusColor,
} from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Headphones,
  RefreshCw,
  Search,
  TimerReset,
} from "lucide-react";
import type { Order } from "@greenmart/shared";
import type { OrderRequestStatus } from "@/lib/api-client";
import { OrderStatusModal } from "@/components/forms";
import { exportToCSV } from "@/lib/export-excel";
import { useToast } from "@/components/ui/Toast";

const requestStatusLabels: Record<OrderRequestStatus, string> = {
  RECEIVED: "접수",
  CONTACTED: "연락 완료",
  CONFIRMED: "확정",
  CANCELLED: "취소",
};

const requestStatusColors: Record<OrderRequestStatus, string> = {
  RECEIVED: "bg-yellow-100 text-yellow-800",
  CONTACTED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-700",
};

const riskColors = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  HIGH: "bg-red-100 text-red-800",
} as const;

const webhookLabels = {
  NOT_CONFIGURED: "미설정",
  PENDING: "대기",
  DELIVERED: "전달 완료",
  FAILED: "실패",
} as const;

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  const { toast } = useToast();

  const { data: requestData, isLoading: isRequestLoading } = useOrderRequests({
    page: 1,
    size: 5,
    search: debouncedSearch || undefined,
  });
  const updateRequestStatus = useUpdateOrderRequestStatus();
  const retryWebhooks = useRetryOrderRequestWebhooks();
  const { data, isLoading, isError, error } = useOrders({
    page,
    size: 20,
    status: statusFilter || undefined,
    search: debouncedSearch || undefined,
  });

  const filtered = data?.items ?? [];
  const statusCounts = data?.statusCounts ?? {
    total: 0,
    PENDING: 0,
    CONFIRMED: 0,
    PROCESSING: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };

  const orderRequests = requestData?.items ?? [];
  const requestSummary = requestData?.summary ?? {
    total: 0,
    received: 0,
    contacted: 0,
    confirmed: 0,
    cancelled: 0,
    highRisk: 0,
    webhookFailed: 0,
    slaBreached: 0,
  };

  const handleRequestStatusChange = (
    id: string,
    status: OrderRequestStatus,
  ) => {
    updateRequestStatus.mutate(
      { id, status },
      {
        onSuccess: () => {
          toast("success", "주문 요청 상태가 변경되었습니다.");
        },
        onError: (mutationError) => {
          toast(
            "error",
            mutationError instanceof Error
              ? mutationError.message
              : "주문 요청 상태를 변경하지 못했습니다.",
          );
        },
      },
    );
  };

  const handleWebhookRetry = () => {
    retryWebhooks.mutate(undefined, {
      onSuccess: (result) => {
        toast(
          result.delivered > 0 ? "success" : "info",
          result.delivered > 0
            ? `${result.delivered}건의 웹훅 전달을 완료했습니다.`
            : "재시도 가능한 웹훅 작업이 없습니다.",
        );
      },
      onError: (mutationError) => {
        toast(
          "error",
          mutationError instanceof Error
            ? mutationError.message
            : "웹훅 재시도에 실패했습니다.",
        );
      },
    });
  };

  return (
    <>
      <Header
        title="주문 관리"
        description="세틀먼트 플랫폼 · 주문 처리 및 결제 관리"
      />
      <div className="p-6 space-y-6 animate-fade-in">
        <section className="grid gap-4 md:grid-cols-4">
          {[
            {
              label: "접수 대기",
              value: requestSummary.received,
              icon: Headphones,
              tone: "text-yellow-700 bg-yellow-50",
            },
            {
              label: "고위험 요청",
              value: requestSummary.highRisk,
              icon: AlertTriangle,
              tone: "text-red-700 bg-red-50",
            },
            {
              label: "웹훅 실패",
              value: requestSummary.webhookFailed,
              icon: RefreshCw,
              tone: "text-blue-700 bg-blue-50",
            },
            {
              label: "SLA 초과",
              value: requestSummary.slaBreached,
              icon: TimerReset,
              tone: "text-gray-700 bg-gray-50",
            },
          ].map((metric) => {
            const Icon = metric.icon;

            return (
              <div key={metric.label} className="card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      {metric.label}
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      {metric.value.toLocaleString("ko-KR")}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-lg",
                      metric.tone,
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
              </div>
            );
          })}
        </section>

        <section className="card overflow-hidden">
          <div className="flex flex-col gap-2 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                고객 주문 요청 큐
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                중복 방지, 가격 검산, 재고 리스크, 외부 운영 도구 전달 상태를
                함께 추적합니다.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                총 {requestSummary.total.toLocaleString("ko-KR")}건
              </span>
              <button
                type="button"
                className="btn-secondary px-3 py-2 text-xs"
                disabled={
                  retryWebhooks.isPending || requestSummary.webhookFailed === 0
                }
                onClick={handleWebhookRetry}
              >
                <RefreshCw className="mr-1 h-3 w-3" aria-hidden="true" />
                웹훅 재시도
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">접수번호</th>
                  <th className="table-header">고객</th>
                  <th className="table-header">요청 상품</th>
                  <th className="table-header">배송 슬롯</th>
                  <th className="table-header">금액</th>
                  <th className="table-header">리스크</th>
                  <th className="table-header">웹훅</th>
                  <th className="table-header">SLA</th>
                  <th className="table-header">처리</th>
                </tr>
              </thead>
              <tbody>
                {isRequestLoading &&
                  Array.from({ length: 3 }).map((_, row) => (
                    <tr key={row} className="border-b border-gray-50">
                      {Array.from({ length: 9 }).map((__, cell) => (
                        <td key={cell} className="table-cell">
                          <div className="h-3 w-20 rounded bg-gray-100" />
                        </td>
                      ))}
                    </tr>
                  ))}

                {!isRequestLoading &&
                  orderRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-gray-50 hover:bg-gray-50/80"
                    >
                      <td className="table-cell">
                        <div className="font-mono text-xs font-semibold text-brand-primary">
                          {request.orderNumber}
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          {formatDateTime(request.acceptedAt)}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="font-medium text-gray-900">
                          {request.customer.name}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {request.customer.phone}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm font-medium text-gray-900">
                          {request.items[0]?.name}
                          {request.items.length > 1 &&
                            ` 외 ${request.items.length - 1}건`}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {request.subscriptionPlan.title}
                        </div>
                      </td>
                      <td className="table-cell text-sm">
                        <div>{request.deliverySlot.label}</div>
                        <div className="text-xs text-gray-500">
                          {request.deliverySlot.time}
                        </div>
                      </td>
                      <td className="table-cell font-semibold">
                        {formatCurrency(request.pricing.total)}
                      </td>
                      <td className="table-cell">
                        <span
                          className={cn(
                            "badge",
                            riskColors[request.fulfillmentRisk],
                          )}
                          title={request.riskReasons.join(", ") || "정상"}
                        >
                          {request.fulfillmentRisk}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="text-xs text-gray-600">
                          {webhookLabels[request.webhookSyncStatus]}
                          {request.webhookAttempts > 0 &&
                            ` · ${request.webhookAttempts}회`}
                        </span>
                        {request.nextWebhookAttemptAt &&
                          request.webhookSyncStatus === "FAILED" && (
                            <div className="mt-1 text-xs text-gray-400">
                              다음 {formatDateTime(request.nextWebhookAttemptAt)}
                            </div>
                          )}
                      </td>
                      <td className="table-cell text-xs text-gray-500">
                        {formatDateTime(request.slaDueAt)}
                      </td>
                      <td className="table-cell">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "badge",
                              requestStatusColors[request.status],
                            )}
                          >
                            {requestStatusLabels[request.status]}
                          </span>
                          {request.status === "RECEIVED" && (
                            <button
                              type="button"
                              className="btn-secondary px-2 py-1 text-xs"
                              disabled={updateRequestStatus.isPending}
                              onClick={() =>
                                handleRequestStatusChange(
                                  request.id,
                                  "CONTACTED",
                                )
                              }
                            >
                              연락 완료
                            </button>
                          )}
                          {request.status !== "CONFIRMED" &&
                            request.status !== "CANCELLED" && (
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-md bg-brand-primary px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-brand-primary/90 disabled:opacity-50"
                                disabled={updateRequestStatus.isPending}
                                onClick={() =>
                                  handleRequestStatusChange(
                                    request.id,
                                    "CONFIRMED",
                                  )
                                }
                              >
                                <CheckCircle2
                                  className="h-3 w-3"
                                  aria-hidden="true"
                                />
                                확정
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}

                {!isRequestLoading && orderRequests.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="table-cell py-10 text-center text-gray-400"
                    >
                      접수된 주문 요청이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex gap-2 flex-wrap" role="tablist">
          {[
            { key: "", label: "전체", count: statusCounts.total },
            { key: "PENDING", label: "결제 대기", count: statusCounts.PENDING },
            {
              key: "CONFIRMED",
              label: "주문 확인",
              count: statusCounts.CONFIRMED,
            },
            {
              key: "PROCESSING",
              label: "처리 중",
              count: statusCounts.PROCESSING,
            },
            {
              key: "DELIVERED",
              label: "배송 완료",
              count: statusCounts.DELIVERED,
            },
            { key: "CANCELLED", label: "취소", count: statusCounts.CANCELLED },
          ].map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={statusFilter === tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                statusFilter === tab.key
                  ? "bg-brand-primary text-white border-brand-primary"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
              )}
            >
              {tab.label}{" "}
              <span className="ml-1 text-xs opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        <div className="card p-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="주문번호, 고객명 검색..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input-field pl-9"
              aria-label="주문 검색"
            />
          </div>
          <button
            className="btn-secondary"
            onClick={() => {
              if (filtered.length === 0) return;
              exportToCSV(
                filtered,
                [
                  { header: "주문번호", accessor: (o) => o.orderNumber },
                  { header: "고객명", accessor: (o) => o.customerName },
                  {
                    header: "상품",
                    accessor: (o) =>
                      o.items.map((i) => i.productName).join(", "),
                  },
                  { header: "결제금액", accessor: (o) => o.totalAmount },
                  {
                    header: "결제수단",
                    accessor: (o) => getPaymentMethodLabel(o.paymentMethod),
                  },
                  {
                    header: "상태",
                    accessor: (o) => getOrderStatusLabel(o.status),
                  },
                  { header: "주문일시", accessor: (o) => o.orderedAt },
                ],
                "주문목록",
              );
              toast("success", "주문 목록이 다운로드되었습니다.");
            }}
          >
            <Download className="h-4 w-4 mr-1" /> 내보내기
          </button>
        </div>

        {isLoading && (
          <div
            className="card overflow-hidden"
            role="status"
            aria-label="주문 목록 로딩 중"
          >
            <span className="sr-only">주문 데이터를 불러오는 중입니다...</span>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {[
                    "주문번호",
                    "고객명",
                    "상품",
                    "금액",
                    "결제",
                    "상태",
                    "일시",
                  ].map((h) => (
                    <th key={h} className="table-header">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-50 dark:border-gray-800/50"
                  >
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="table-cell">
                        <div
                          className={`h-3 bg-gray-200 dark:bg-gray-800 rounded relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent`}
                          style={{ width: `${40 + Math.random() * 40}%` }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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

        {!isLoading && !isError && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="table-header">주문번호</th>
                    <th className="table-header">고객</th>
                    <th className="table-header">상품</th>
                    <th className="table-header">결제금액</th>
                    <th className="table-header">결제수단</th>
                    <th className="table-header">상태</th>
                    <th className="table-header">주문일시</th>
                    <th className="table-header">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-50 hover:bg-gray-50/80"
                    >
                      <td className="table-cell font-mono text-xs text-brand-primary font-medium">
                        <Link
                          href={`/settlement/orders/${order.id}`}
                          className="hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="table-cell font-medium">
                        {order.customerName}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {order.items.slice(0, 3).map((item) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={item.id}
                                src={item.productImage}
                                alt=""
                                className="h-8 w-8 rounded-lg object-cover border-2 border-white"
                                loading="lazy"
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {order.items[0]?.productName}
                            {order.items.length > 1 &&
                              ` 외 ${order.items.length - 1}건`}
                          </span>
                        </div>
                      </td>
                      <td className="table-cell font-semibold">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="table-cell text-sm">
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </td>
                      <td className="table-cell">
                        <span
                          className={cn("badge", getStatusColor(order.status))}
                        >
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="table-cell text-xs text-gray-500">
                        {formatDateTime(order.orderedAt)}
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-blue-50 rounded-lg transition-colors"
                          aria-label="상태 변경"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="table-cell text-center text-gray-400 py-12"
                      >
                        검색 결과가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              주문 상세: {filtered[0].orderNumber}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase">
                  주문 항목
                </h4>
                {filtered[0].items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.productImage}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity}개 × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      {formatCurrency(item.finalPrice)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase">
                  결제 내역
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">상품 합계</span>
                    <span>{formatCurrency(filtered[0].subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">배송비</span>
                    <span>{formatCurrency(filtered[0].shippingFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">상품 할인</span>
                    <span className="text-red-500">
                      -{formatCurrency(filtered[0].discountAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">포인트 사용</span>
                    <span className="text-red-500">
                      -{formatCurrency(filtered[0].pointsUsed)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">쿠폰 할인</span>
                    <span className="text-red-500">
                      -{formatCurrency(filtered[0].couponDiscount)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
                    <span>총 결제금액</span>
                    <span className="text-brand-primary">
                      {formatCurrency(filtered[0].totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <OrderStatusModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </>
  );
}
