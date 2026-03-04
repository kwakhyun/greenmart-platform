"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { useOrders, useDebounce } from "@/hooks";
import {
  cn,
  formatCurrency,
  formatDateTime,
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getStatusColor,
} from "@/lib/utils";
import { Search, Download, Loader2, RefreshCw } from "lucide-react";
import type { Order } from "@greenmart/shared";
import { OrderStatusModal } from "@/components/forms";
import { exportToCSV } from "@/lib/export-excel";
import { useToast } from "@/components/ui/Toast";

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  const { toast } = useToast();

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

  return (
    <>
      <Header
        title="주문 관리"
        description="세틀먼트 플랫폼 · 주문 처리 및 결제 관리"
      />
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Status Tabs */}
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

        {/* Filters */}
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

        {/* Loading */}
        {isLoading && (
          <div className="card p-16 text-center">
            <Loader2 className="h-8 w-8 text-brand-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">
              주문 데이터를 불러오는 중...
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

        {/* Orders Table */}
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

        {/* Order Detail Preview */}
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

      {/* Order Status Modal */}
      <OrderStatusModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </>
  );
}
