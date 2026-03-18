"use client";

/**
 * 키보드 사용자를 위한 Skip Link 컴포넌트
 * - Tab으로 포커스 시 화면에 표시
 * - 메인 컨텐츠로 바로 이동
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:inline-flex focus:items-center focus:gap-2 focus:rounded-lg focus:bg-brand-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:ring-offset-2 transition-all"
    >
      본문으로 건너뛰기
    </a>
  );
}
