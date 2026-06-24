"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const pathLabels: Record<string, string> = {
  admin: "운영 대시보드",
  catalog: "카탈로그",
  products: "상품 관리",
  customer: "커스터머",
  members: "회원 관리",
  promotions: "프로모션",
  voc: "고객의 소리",
  inventory: "인벤토리",
  stock: "재고 관리",
  delivery: "배송 관리",
  settlement: "세틀먼트",
  orders: "주문 관리",
  settlements: "정산 관리",
};

/**
 * 현재 경로 기반 자동 Breadcrumb
 * - 접근성 nav landmark
 * - 마지막 항목은 aria-current="page"
 */
export function Breadcrumb() {
  const pathname = usePathname();

  const crumbs = useMemo(() => {
    if (pathname === "/") return [];

    const segments = pathname.split("/").filter(Boolean);
    return segments.map((segment, idx) => {
      const href = "/" + segments.slice(0, idx + 1).join("/");
      const label = pathLabels[segment] || decodeURIComponent(segment);
      const isLast = idx === segments.length - 1;
      return { href, label, isLast };
    });
  }, [pathname]);

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="breadcrumb" className="px-4 lg:px-6 pt-3 pb-0">
      <ol className="flex items-center gap-1 text-xs">
        <li>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Home className="h-3 w-3" />
            <span className="sr-only">운영 홈</span>
          </Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-gray-300 dark:text-gray-600" />
            {crumb.isLast ? (
              <span
                className="font-medium text-gray-700 dark:text-gray-300"
                aria-current="page"
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
