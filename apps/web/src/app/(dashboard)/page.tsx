"use client";

import { DollarSign, ShoppingCart, Users, Eye, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import StatCard from "@/components/dashboard/StatCard";
import {
  SalesChart,
  CategoryPieChart,
  TopProductsTable,
  RecentOrdersTable,
} from "@/components/dashboard/Charts";
import { useDashboard } from "@/hooks";
import { formatCompactNumber, formatPercent } from "@/lib/utils";

export default function DashboardPage() {
  const { data: summary, isLoading, isError, error } = useDashboard();

  if (isLoading) {
    return (
      <>
        <Header title="대시보드" description="코어 플랫폼 실시간 현황" />
        <div className="p-6">
          <div className="card p-16 text-center">
            <Loader2 className="h-8 w-8 text-brand-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">
              대시보드 데이터를 불러오는 중...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (isError || !summary) {
    return (
      <>
        <Header title="대시보드" description="코어 플랫폼 실시간 현황" />
        <div className="p-6">
          <div className="card p-16 text-center">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              대시보드를 불러오지 못했습니다
            </h3>
            <p className="text-xs text-gray-500">
              {error instanceof Error
                ? error.message
                : "잠시 후 다시 시도해주세요."}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="대시보드" description="코어 플랫폼 실시간 현황" />
      <div className="p-6 space-y-6 animate-fade-in">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="오늘 매출"
            value={formatCompactNumber(summary.todaySales)}
            change={formatPercent(summary.salesGrowthRate)}
            changeType="positive"
            icon={DollarSign}
            iconColor="bg-green-100 text-green-600"
          />
          <StatCard
            title="오늘 주문"
            value={summary.todayOrders.toLocaleString()}
            change={formatPercent(summary.ordersGrowthRate)}
            changeType="positive"
            icon={ShoppingCart}
            iconColor="bg-blue-100 text-blue-600"
          />
          <StatCard
            title="신규 회원"
            value={summary.todayNewCustomers.toLocaleString()}
            change={formatPercent(summary.customersGrowthRate)}
            changeType="positive"
            icon={Users}
            iconColor="bg-purple-100 text-purple-600"
          />
          <StatCard
            title="페이지뷰"
            value={formatCompactNumber(summary.todayPageViews)}
            change={formatPercent(summary.pageViewsGrowthRate)}
            changeType="positive"
            icon={Eye}
            iconColor="bg-orange-100 text-orange-600"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart monthlySales={summary.monthlySales} />
          <CategoryPieChart categoryBreakdown={summary.categoryBreakdown} />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopProductsTable topProducts={summary.topProducts} />
          <RecentOrdersTable recentOrders={summary.recentOrders} />
        </div>
      </div>
    </>
  );
}
