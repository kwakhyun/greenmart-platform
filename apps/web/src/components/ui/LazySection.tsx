"use client";

import { useIntersectionObserver } from "@/hooks";
import { Skeleton } from "./Skeleton";

interface LazySectionProps {
  children: React.ReactNode;
  className?: string;
  fallbackHeight?: string;
}

/**
 * 뷰포트에 진입할 때만 렌더링하는 Lazy Section
 * - Intersection Observer로 감지
 * - 진입 전에는 Skeleton placeholder 표시
 * - 차트 등 무거운 컴포넌트의 초기 렌더링 최적화
 */
export function LazySection({
  children,
  className,
  fallbackHeight = "350px",
}: LazySectionProps) {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    rootMargin: "100px",
    triggerOnce: true,
  });

  return (
    <div ref={ref} className={className}>
      {isIntersecting ? (
        <div className="animate-fade-in">{children}</div>
      ) : (
        <div
          className="rounded-xl"
          style={{ height: fallbackHeight }}
          aria-hidden="true"
        >
          <Skeleton variant="rounded" className="w-full h-full" />
        </div>
      )}
    </div>
  );
}
