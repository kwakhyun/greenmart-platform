import { useEffect, useState } from "react";

/**
 * prefers-reduced-motion 미디어 쿼리를 감지하는 훅
 * - 사용자가 시스템 접근성에서 모션 감소를 설정한 경우 감지
 * - 애니메이션을 조건부로 적용하는 데 사용
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mediaQuery.matches);

    function handleChange(e: MediaQueryListEvent) {
      setPrefersReduced(e.matches);
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReduced;
}
