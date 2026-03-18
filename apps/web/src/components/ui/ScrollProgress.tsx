"use client";

import { useEffect, useState } from "react";

/**
 * 스크롤 진행률을 시각적으로 표시하는 프로그레스 바
 * 페이지 최상단에 브랜드 컬러로 표시
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min((scrollTop / docHeight) * 100, 100));
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (progress <= 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-0.5"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="페이지 스크롤 진행률"
    >
      <div
        className="h-full bg-gradient-to-r from-brand-primary via-brand-primary to-green-400 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
