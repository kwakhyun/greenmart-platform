"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  count?: number;
}

/**
 * 고급 스켈레톤 로딩 컴포넌트
 * - Shimmer 애니메이션
 * - 다크모드 대응
 * - 다양한 variant 지원
 */
export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const baseStyles =
    "relative overflow-hidden bg-gray-200 dark:bg-gray-800 before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/20 dark:before:via-white/5 before:to-transparent";

  const variantStyles = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-lg",
  };

  const style: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(baseStyles, variantStyles[variant], className)}
            style={{
              ...style,
              width: i === count - 1 ? "75%" : style.width,
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={style}
      aria-hidden="true"
    />
  );
}

// ─── 대시보드 스켈레톤 ───────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6" role="status" aria-label="대시보드 로딩 중">
      <span className="sr-only">대시보드 데이터를 불러오는 중입니다...</span>

      {/* StatCard 스켈레톤 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" width="80px" height="12px" />
              <Skeleton variant="rounded" width="32px" height="32px" />
            </div>
            <div className="flex items-end gap-2">
              <Skeleton variant="text" width="100px" height="28px" />
              <Skeleton variant="text" width="48px" height="14px" />
            </div>
          </div>
        ))}
      </div>

      {/* 차트 스켈레톤 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <Skeleton
            variant="text"
            width="120px"
            height="16px"
            className="mb-4"
          />
          <div className="flex items-end gap-2 h-[280px] px-4 pt-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end">
                <Skeleton
                  variant="rounded"
                  className="w-full"
                  height={`${40 + Math.random() * 60}%`}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <Skeleton
            variant="text"
            width="140px"
            height="16px"
            className="mb-4"
          />
          <div className="flex items-center justify-center h-[280px]">
            <Skeleton variant="circular" width="200px" height="200px" />
          </div>
        </div>
      </div>

      {/* 테이블 스켈레톤 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <Skeleton
            variant="text"
            width="100px"
            height="16px"
            className="mb-4"
          />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton variant="circular" width="28px" height="28px" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton variant="text" height="14px" />
                  <Skeleton variant="text" width="60%" height="10px" />
                </div>
                <Skeleton variant="text" width="60px" height="14px" />
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <Skeleton variant="text" width="80px" height="16px" />
            <Skeleton variant="text" width="60px" height="12px" />
          </div>
          <TableSkeleton rows={5} cols={4} />
        </div>
      </div>
    </div>
  );
}

// ─── 테이블 스켈레톤 ─────────────────────────────────────
export function TableSkeleton({
  rows = 5,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="overflow-x-auto" role="status" aria-label="테이블 로딩 중">
      <span className="sr-only">테이블 데이터를 불러오는 중입니다...</span>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="table-header">
                <Skeleton
                  variant="text"
                  height="10px"
                  width={`${50 + Math.random() * 30}%`}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr
              key={rowIdx}
              className="border-b border-gray-50 dark:border-gray-800/50"
            >
              {Array.from({ length: cols }).map((_, colIdx) => (
                <td key={colIdx} className="table-cell">
                  <Skeleton
                    variant="text"
                    height="12px"
                    width={colIdx === 0 ? "80%" : `${40 + Math.random() * 40}%`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── 상품 카드 스켈레톤 ──────────────────────────────────
export function ProductCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      role="status"
      aria-label="상품 목록 로딩 중"
    >
      <span className="sr-only">상품 데이터를 불러오는 중입니다...</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <Skeleton variant="rectangular" height="160px" className="w-full" />
          <div className="p-4 space-y-2">
            <Skeleton variant="text" height="14px" />
            <Skeleton variant="text" width="60%" height="12px" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton variant="text" width="80px" height="16px" />
              <Skeleton variant="rounded" width="48px" height="20px" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 리스트 아이템 스켈레톤 ──────────────────────────────
export function ListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="목록 로딩 중">
      <span className="sr-only">목록 데이터를 불러오는 중입니다...</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4 flex items-center gap-4">
          <Skeleton variant="circular" width="40px" height="40px" />
          <div className="flex-1 space-y-1.5">
            <Skeleton
              variant="text"
              height="14px"
              width={`${60 + Math.random() * 30}%`}
            />
            <Skeleton
              variant="text"
              height="10px"
              width={`${40 + Math.random() * 20}%`}
            />
          </div>
          <Skeleton variant="rounded" width="64px" height="24px" />
        </div>
      ))}
    </div>
  );
}
