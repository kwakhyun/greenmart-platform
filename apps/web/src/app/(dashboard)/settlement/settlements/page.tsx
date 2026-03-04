"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import { useSettlements } from "@/hooks";
import {
  cn,
  formatCurrency,
  formatCompactNumber,
  getSettlementStatusLabel,
  getStatusColor,
} from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  Loader2,
  Filter,
} from "lucide-react";

export default function SettlementsPage() {
  const [periodFilter, setPeriodFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading, isError, error } = useSettlements({
    period: periodFilter || undefined,
    status: statusFilter || undefined,
  });

  const settlements = data?.items ?? [];
  const summary = data?.summary ?? {
    totalSales: 0,
    totalRefunds: 0,
    totalCommission: 0,
    totalNet: 0,
  };

  return (
    <>
      <Header
        title="정산 관리"
        description="세틀먼트 플랫폼 · 비즈니스 모델 유연 정산 시스템"
      />
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">총 매출</span>
              <div className="rounded-lg p-2 bg-blue-100">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <span className="text-xl font-bold text-gray-900">
              {formatCompactNumber(summary.totalSales)}
            </span>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">총 환불</span>
              <div className="rounded-lg p-2 bg-red-100">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <span className="text-xl font-bold text-red-600">
              {formatCompactNumber(summary.totalRefunds)}
            </span>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                총 수수료
              </span>
              <div className="rounded-lg p-2 bg-yellow-100">
                <BarChart3 className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <span className="text-xl font-bold text-gray-900">
              {formatCompactNumber(summary.totalCommission)}
            </span>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                순 정산금
              </span>
              <div className="rounded-lg p-2 bg-green-100">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <span className="text-xl font-bold text-brand-primary">
              {formatCompactNumber(summary.totalNet)}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="input-field w-44"
            aria-label="기간 필터"
          >
            <option value="">전체 기간</option>
            <option value="2026-02">2026년 2월</option>
            <option value="2026-01">2026년 1월</option>
            <option value="2025-12">2025년 12월</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-36"
            aria-label="상태 필터"
          >
            <option value="">전체 상태</option>
            <option value="PENDING">정산 대기</option>
            <option value="CONFIRMED">정산 확정</option>
            <option value="PAID">지급 완료</option>
          </select>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="card p-16 text-center">
            <Loader2 className="h-8 w-8 text-brand-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">
              정산 데이터를 불러오는 중...
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

        {/* Settlement Table */}
        {!isLoading && !isError && settlements.length > 0 && (
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">정산 내역</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                파트너사별 정산 현황 · 총 {settlements.length}건
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="table-header">파트너사</th>
                    <th className="table-header text-right">총 매출</th>
                    <th className="table-header text-right">환불</th>
                    <th className="table-header text-right">수수료율</th>
                    <th className="table-header text-right">수수료</th>
                    <th className="table-header text-right">배송비 정산</th>
                    <th className="table-header text-right">프로모션 분담</th>
                    <th className="table-header text-right">순 정산금</th>
                    <th className="table-header">주문수</th>
                    <th className="table-header">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map((stl) => (
                    <tr
                      key={stl.id}
                      className="border-b border-gray-50 hover:bg-gray-50/80 cursor-pointer"
                    >
                      <td className="table-cell">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {stl.partnerName}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {stl.period}
                          </p>
                        </div>
                      </td>
                      <td className="table-cell text-right text-sm font-medium">
                        {formatCompactNumber(stl.totalSales)}
                      </td>
                      <td className="table-cell text-right text-sm text-red-600">
                        -{formatCompactNumber(stl.totalRefunds)}
                      </td>
                      <td className="table-cell text-right text-sm">
                        {stl.commissionRate}%
                      </td>
                      <td className="table-cell text-right text-sm">
                        {formatCompactNumber(stl.commissionAmount)}
                      </td>
                      <td className="table-cell text-right text-sm">
                        {formatCompactNumber(stl.shippingFeeSettlement)}
                      </td>
                      <td className="table-cell text-right text-sm">
                        {formatCompactNumber(stl.promotionCostShare)}
                      </td>
                      <td className="table-cell text-right text-sm font-bold text-brand-primary">
                        {formatCompactNumber(stl.netAmount)}
                      </td>
                      <td className="table-cell text-sm">
                        <div>
                          <span>{stl.orderCount.toLocaleString()}건</span>
                          <p className="text-[10px] text-red-500">
                            환불 {stl.refundCount}건
                          </p>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span
                          className={cn("badge", getStatusColor(stl.status))}
                        >
                          {getSettlementStatusLabel(stl.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="table-cell">합계</td>
                    <td className="table-cell text-right text-sm">
                      {formatCompactNumber(summary.totalSales)}
                    </td>
                    <td className="table-cell text-right text-sm text-red-600">
                      -{formatCompactNumber(summary.totalRefunds)}
                    </td>
                    <td className="table-cell"></td>
                    <td className="table-cell text-right text-sm">
                      {formatCompactNumber(summary.totalCommission)}
                    </td>
                    <td className="table-cell text-right text-sm">
                      {formatCompactNumber(
                        settlements.reduce(
                          (s, i) => s + i.shippingFeeSettlement,
                          0,
                        ),
                      )}
                    </td>
                    <td className="table-cell text-right text-sm">
                      {formatCompactNumber(
                        settlements.reduce(
                          (s, i) => s + i.promotionCostShare,
                          0,
                        ),
                      )}
                    </td>
                    <td className="table-cell text-right text-sm text-brand-primary">
                      {formatCompactNumber(summary.totalNet)}
                    </td>
                    <td className="table-cell text-sm">
                      {settlements
                        .reduce((s, i) => s + i.orderCount, 0)
                        .toLocaleString()}
                      건
                    </td>
                    <td className="table-cell"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && settlements.length === 0 && (
          <div className="card p-16 text-center">
            <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              정산 내역이 없습니다
            </h3>
            <p className="text-xs text-gray-500">
              조건에 맞는 정산 데이터가 없습니다.
            </p>
          </div>
        )}

        {/* Settlement Flow */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            정산 프로세스
          </h3>
          <div className="flex items-center justify-between flex-wrap gap-4">
            {[
              { step: 1, label: "주문 집계", desc: "월별 주문 데이터 수집" },
              {
                step: 2,
                label: "정산 산출",
                desc: "수수료/배송비/프로모션 계산",
              },
              {
                step: 3,
                label: "정산 확정",
                desc: "파트너사 확인 및 이의 처리",
              },
              { step: 4, label: "지급 완료", desc: "정산금 계좌 이체" },
            ].map((item, idx) => (
              <div key={item.step} className="flex items-center">
                <div className="text-center">
                  <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm font-bold text-brand-primary">
                      {item.step}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-900">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-gray-400">{item.desc}</p>
                </div>
                {idx < 3 && (
                  <ArrowUpRight className="h-5 w-5 text-gray-300 mx-4 lg:mx-6 rotate-45" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
