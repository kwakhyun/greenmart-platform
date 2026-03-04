"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import { useStock, useWarehouses, useDebounce } from "@/hooks";
import { cn, getStatusColor } from "@/lib/utils";
import { STOCK_STATUS_LABELS } from "@/lib/constants";
import { AlertTriangle, Warehouse, Search, Loader2 } from "lucide-react";

export default function StockPage() {
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data: warehousesData } = useWarehouses();
  const { data: stockData, isLoading } = useStock({
    warehouseId: warehouseFilter || undefined,
    status: statusFilter || undefined,
    search: debouncedSearch || undefined,
  });

  const warehouses = warehousesData ?? [];
  const inventoryItems = stockData?.items ?? [];
  const summary = stockData?.summary ?? {
    total: 0,
    lowStock: 0,
    outOfStock: 0,
  };

  return (
    <>
      <Header
        title="재고 관리"
        description="인벤토리 플랫폼 · 물류 및 재고 아키텍처"
      />
      <div className="p-6 space-y-6 animate-fade-in">
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            창고 현황
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {warehouses.map((wh) => {
              const usagePercent = (wh.currentUsage / wh.capacity) * 100;
              return (
                <div
                  key={wh.id}
                  className="card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <Warehouse className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {wh.name}
                      </h3>
                      <p className="text-[10px] text-gray-400">
                        {wh.code} · {wh.type}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{wh.address}</p>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>
                      사용량: {wh.currentUsage.toLocaleString()} /{" "}
                      {wh.capacity.toLocaleString()}
                    </span>
                    <span
                      className={cn(
                        usagePercent > 80 ? "text-red-600 font-semibold" : "",
                      )}
                    >
                      {usagePercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        usagePercent > 80
                          ? "bg-red-500"
                          : usagePercent > 60
                            ? "bg-yellow-500"
                            : "bg-brand-primary",
                      )}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {(summary.lowStock > 0 || summary.outOfStock > 0) && (
          <div
            className="card p-4 border-l-4 border-l-orange-500 bg-orange-50/50"
            role="alert"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                재고 주의: 부족 {summary.lowStock}건, 품절 {summary.outOfStock}
                건
              </span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="상품명, SKU 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
              aria-label="재고 검색"
            />
          </div>
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="input-field w-40"
            aria-label="창고 필터"
          >
            <option value="">전체 창고</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-36"
            aria-label="상태 필터"
          >
            <option value="">전체 상태</option>
            <option value="IN_STOCK">정상</option>
            <option value="LOW_STOCK">부족</option>
            <option value="OUT_OF_STOCK">품절</option>
          </select>
        </div>

        {isLoading && (
          <div className="card p-16 text-center">
            <Loader2 className="h-8 w-8 text-brand-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">
              재고 데이터를 불러오는 중...
            </p>
          </div>
        )}

        {!isLoading && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="table-header">상품</th>
                    <th className="table-header">SKU</th>
                    <th className="table-header">창고</th>
                    <th className="table-header">총 수량</th>
                    <th className="table-header">예약</th>
                    <th className="table-header">가용</th>
                    <th className="table-header">리오더 포인트</th>
                    <th className="table-header">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryItems.map((item) => (
                    <tr
                      key={item.id}
                      className={cn(
                        "border-b border-gray-50 hover:bg-gray-50/80",
                        item.status === "OUT_OF_STOCK" && "bg-red-50/50",
                        item.status === "LOW_STOCK" && "bg-yellow-50/50",
                      )}
                    >
                      <td className="table-cell font-medium text-gray-900">
                        {item.productName}
                      </td>
                      <td className="table-cell font-mono text-xs">
                        {item.sku}
                      </td>
                      <td className="table-cell text-sm">
                        {item.warehouseName}
                      </td>
                      <td className="table-cell font-medium">
                        {item.quantity.toLocaleString()}
                      </td>
                      <td className="table-cell text-sm text-gray-500">
                        {item.reservedQuantity.toLocaleString()}
                      </td>
                      <td className="table-cell font-medium">
                        {item.availableQuantity.toLocaleString()}
                      </td>
                      <td className="table-cell text-sm">
                        <span
                          className={cn(
                            item.availableQuantity <= item.reorderPoint
                              ? "text-red-600 font-semibold"
                              : "text-gray-500",
                          )}
                        >
                          {item.reorderPoint.toLocaleString()}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span
                          className={cn("badge", getStatusColor(item.status))}
                        >
                          {STOCK_STATUS_LABELS[item.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {inventoryItems.length === 0 && (
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
      </div>
    </>
  );
}
