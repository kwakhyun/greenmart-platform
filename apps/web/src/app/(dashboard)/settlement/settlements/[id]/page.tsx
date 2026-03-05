"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { useSettlement } from "@/hooks";
import {
  cn,
  formatCurrency,
  formatCompactNumber,
  formatDate,
  getSettlementStatusLabel,
  getStatusColor,
} from "@/lib/utils";
import {
  ArrowLeft,
  Building2,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Truck,
  Tag,
  ShoppingCart,
  Loader2,
  CheckCircle2,
  Clock,
  Calculator,
} from "lucide-react";

export default function SettlementDetailPage() {
  const params = useParams();
  const settlementId = typeof params.id === "string" ? params.id : "";
  const { data: stl, isLoading, isError } = useSettlement(settlementId);

  if (isLoading) {
    return (
      <>
        <Header title="정산 관리" description="세틀먼트 플랫폼" />
        <div className="p-6">
          <div className="card p-16 text-center">
            <Loader2 className="h-8 w-8 text-brand-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">정산 정보를 불러오는 중...</p>
          </div>
        </div>
      </>
    );
  }

  if (isError || !stl) {
    return (
      <>
        <Header title="정산 관리" description="세틀먼트 플랫폼" />
        <div className="p-6">
          <div className="card p-16 text-center">
            <p className="text-sm text-gray-500 mb-4">
              정산 내역을 찾을 수 없습니다.
            </p>
            <Link
              href="/settlement/settlements"
              className="text-sm text-brand-primary hover:underline"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </>
    );
  }

  // 정산 금액 브레이크다운
  const breakdown = [
    {
      label: "총 매출",
      amount: stl.totalSales,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      sign: "+",
    },
    {
      label: "환불 차감",
      amount: -stl.totalRefunds,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100",
      sign: "-",
    },
    {
      label: `수수료 (${stl.commissionRate}%)`,
      amount: -stl.commissionAmount,
      icon: BarChart3,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      sign: "-",
    },
    {
      label: "배송비 정산",
      amount: -stl.shippingFeeSettlement,
      icon: Truck,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      sign: "-",
    },
    {
      label: "프로모션 분담",
      amount: -stl.promotionCostShare,
      icon: Tag,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
      sign: "-",
    },
  ];

  const statusSteps = [
    { key: "PENDING", label: "정산 대기" },
    { key: "CALCULATED", label: "산출 완료" },
    { key: "CONFIRMED", label: "정산 확정" },
    { key: "PAID", label: "지급 완료" },
  ];
  const currentStepIdx = statusSteps.findIndex((s) => s.key === stl.status);

  return (
    <>
      <Header title="정산 상세" description="세틀먼트 플랫폼" />
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Back */}
        <Link
          href="/settlement/settlements"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          정산 목록
        </Link>

        {/* Title Card */}
        <div className="card p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              <div className="rounded-xl p-3 bg-brand-primary/10">
                <Building2 className="h-6 w-6 text-brand-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {stl.partnerName}
                </h2>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {stl.period}
                  </span>
                  <span>ID: {stl.id}</span>
                </div>
              </div>
            </div>
            <span className={cn("badge text-sm", getStatusColor(stl.status))}>
              {getSettlementStatusLabel(stl.status)}
            </span>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-gray-500">총 매출</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {formatCompactNumber(stl.totalSales)}
            </p>
          </div>
          <div className="card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-xs text-gray-500">순 정산금</span>
            </div>
            <p className="text-xl font-bold text-brand-primary">
              {formatCompactNumber(stl.netAmount)}
            </p>
          </div>
          <div className="card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShoppingCart className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-gray-500">주문 건수</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {stl.orderCount.toLocaleString()}건
            </p>
          </div>
          <div className="card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-xs text-gray-500">환불 건수</span>
            </div>
            <p className="text-xl font-bold text-red-600">
              {stl.refundCount}건
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 정산 금액 브레이크다운 - 2/3 */}
          <div className="lg:col-span-2 card p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-gray-400" />
              정산 금액 상세
            </h3>

            <div className="space-y-3">
              {breakdown.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("rounded-lg p-2", item.bgColor)}>
                        <Icon className={cn("h-4 w-4", item.color)} />
                      </div>
                      <span className="text-sm text-gray-700">
                        {item.label}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        item.amount >= 0 ? "text-gray-900" : "text-red-600",
                      )}
                    >
                      {item.amount >= 0 ? "+" : ""}
                      {formatCurrency(Math.abs(item.amount))}
                    </span>
                  </div>
                );
              })}

              {/* Net Amount */}
              <div className="flex items-center justify-between pt-4 mt-2 border-t-2 border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2 bg-green-100">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    순 정산금
                  </span>
                </div>
                <span className="text-lg font-bold text-brand-primary">
                  {formatCurrency(stl.netAmount)}
                </span>
              </div>
            </div>

            {/* 수수료율 비주얼 */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>수수료율</span>
                <span className="font-medium text-gray-700">
                  {stl.commissionRate}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full"
                  style={{ width: `${stl.commissionRate}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                매출 대비 수수료 비율
              </p>
            </div>
          </div>

          {/* 오른쪽 사이드 - 1/3 */}
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                기본 정보
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">파트너사</span>
                  <span className="font-medium text-gray-900">
                    {stl.partnerName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">파트너 ID</span>
                  <span className="font-mono text-xs text-gray-600">
                    {stl.partnerId}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">정산 기간</span>
                  <span className="font-medium text-gray-900">
                    {stl.period}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">산출일</span>
                  <span className="text-gray-600 text-xs">
                    {formatDate(stl.calculatedAt)}
                  </span>
                </div>
                {stl.paidAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">지급일</span>
                    <span className="text-gray-600 text-xs">
                      {formatDate(stl.paidAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 정산 진행 상태 */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                정산 진행 상태
              </h3>
              <div className="space-y-4">
                {statusSteps.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  return (
                    <div key={step.key} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "h-3 w-3 rounded-full border-2",
                            isDone
                              ? "bg-green-500 border-green-500"
                              : "bg-white border-gray-300",
                          )}
                        />
                        {idx < statusSteps.length - 1 && (
                          <div
                            className={cn(
                              "w-0.5 h-6 mt-1",
                              isDone ? "bg-green-300" : "bg-gray-200",
                            )}
                          />
                        )}
                      </div>
                      <div className="-mt-0.5">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            isDone ? "text-gray-900" : "text-gray-400",
                          )}
                        >
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
