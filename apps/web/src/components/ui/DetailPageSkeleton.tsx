"use client";

/**
 * 상세 페이지 공통 스켈레톤
 * - 이미지 + 정보 카드 + 테이블 형태
 */
export function DetailPageSkeleton() {
  return (
    <div className="p-6 space-y-6" role="status" aria-label="상세 정보 로딩 중">
      <span className="sr-only">상세 데이터를 불러오는 중입니다...</span>

      {/* 메인 정보 카드 */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 이미지 영역 */}
          <div className="w-full md:w-64 h-64 rounded-xl bg-gray-200 dark:bg-gray-800 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/20 dark:before:via-white/5 before:to-transparent" />

          {/* 정보 영역 */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent" />
              <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800/60 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800/60 rounded" />
                  <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 서브 섹션 카드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div
                  key={j}
                  className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800/50"
                >
                  <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800/60 rounded" />
                  <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
