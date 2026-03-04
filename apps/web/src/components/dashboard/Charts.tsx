"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { formatCompactNumber } from "@/lib/utils";
import type { DashboardSummary } from "@greenmart/shared";

const COLORS = [
  "#9bce26",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#6b7280",
];

interface SalesChartProps {
  monthlySales: DashboardSummary["monthlySales"];
}

export function SalesChart({ monthlySales }: SalesChartProps) {
  const data = monthlySales.map((m) => ({
    name: m.date.slice(5),
    매출: m.totalSales / 100000000,
    주문: m.totalOrders / 1000,
  }));

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        월별 매출 추이
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number, name: string) =>
              name === "매출"
                ? [`${value.toFixed(1)}억`, name]
                : [`${value.toFixed(0)}K건`, name]
            }
          />
          <Bar dataKey="매출" fill="#9bce26" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface CategoryPieChartProps {
  categoryBreakdown: DashboardSummary["categoryBreakdown"];
}

export function CategoryPieChart({ categoryBreakdown }: CategoryPieChartProps) {
  const data = categoryBreakdown.map((c) => ({
    name: c.categoryName,
    value: c.percentage,
    sales: c.sales,
  }));

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        카테고리별 매출 비중
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(
              value: number,
              name: string,
              props: { payload?: { sales?: number } },
            ) => [
              `${value}% (${formatCompactNumber(props?.payload?.sales ?? 0)})`,
              name,
            ]}
          />
          <Legend
            formatter={(value: string) => (
              <span className="text-xs text-gray-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface TopProductsTableProps {
  topProducts: DashboardSummary["topProducts"];
}

export function TopProductsTable({ topProducts }: TopProductsTableProps) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        인기 상품 TOP 5
      </h3>
      <div className="space-y-3">
        {topProducts.map((product, index) => (
          <div key={product.productId} className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary/10 text-xs font-bold text-brand-primary">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {product.productName}
              </p>
              <p className="text-xs text-gray-500">
                {product.orders.toLocaleString()}건
              </p>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {formatCompactNumber(product.sales)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface RecentOrdersTableProps {
  recentOrders: DashboardSummary["recentOrders"];
}

export function RecentOrdersTable({ recentOrders }: RecentOrdersTableProps) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">최근 주문</h3>
        <a
          href="/settlement/orders"
          className="text-xs text-brand-primary font-medium hover:underline"
        >
          전체보기 →
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="table-header">주문번호</th>
              <th className="table-header">고객</th>
              <th className="table-header">금액</th>
              <th className="table-header">상태</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-gray-50 hover:bg-gray-50/50"
              >
                <td className="table-cell font-mono text-xs">
                  {order.orderNumber}
                </td>
                <td className="table-cell">{order.customerName}</td>
                <td className="table-cell font-medium">
                  {order.totalAmount.toLocaleString()}원
                </td>
                <td className="table-cell">
                  <span className={`badge ${getOrderBadgeColor(order.status)}`}>
                    {getOrderStatusKo(order.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getOrderBadgeColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-800";
}

function getOrderStatusKo(status: string): string {
  const map: Record<string, string> = {
    PENDING: "결제 대기",
    CONFIRMED: "주문 확인",
    PROCESSING: "처리 중",
    SHIPPED: "배송 중",
    DELIVERED: "배송 완료",
    CANCELLED: "주문 취소",
  };
  return map[status] ?? status;
}
