"use client";

import { Skeleton, TableSkeleton } from "./Skeleton";

/**
 * 테이블 형태 관리 페이지의 공통 스켈레톤
 * - 헤더 + 필터바 + 테이블 형태
 */
export function TablePageSkeleton({
  filterCount = 3,
  cols = 5,
  rows = 10,
}: {
  filterCount?: number;
  cols?: number;
  rows?: number;
}) {
  return (
    <div className="p-6 space-y-4" role="status" aria-label="페이지 로딩 중">
      <span className="sr-only">페이지 데이터를 불러오는 중입니다...</span>

      {/* 필터/액션 바 스켈레톤 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Skeleton variant="rounded" width="240px" height="36px" />
          {Array.from({ length: filterCount }).map((_, i) => (
            <Skeleton key={i} variant="rounded" width="120px" height="36px" />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Skeleton variant="rounded" width="100px" height="36px" />
          <Skeleton variant="rounded" width="100px" height="36px" />
        </div>
      </div>

      {/* 테이블 스켈레톤 */}
      <div className="card overflow-hidden">
        <TableSkeleton rows={rows} cols={cols} />
      </div>

      {/* 페이지네이션 스켈레톤 */}
      <div className="flex items-center justify-center gap-2 pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width="32px" height="32px" />
        ))}
      </div>
    </div>
  );
}
