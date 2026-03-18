"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatter?: (n: number) => string;
  className?: string;
}

/**
 * 숫자가 카운트업 애니메이션으로 올라가는 컴포넌트
 * - easeOutExpo로 자연스러운 감속
 * - prefers-reduced-motion 시 즉시 표시
 * - Intersection Observer와 결합하여 뷰포트 진입 시 시작
 */
export function AnimatedNumber({
  value,
  duration = 1200,
  formatter = (n) => n.toLocaleString(),
  className,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prefersReduced = useReducedMotion();
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReduced) {
      setDisplayValue(value);
      return;
    }

    startTimeRef.current = null;

    function animate(timestamp: number) {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setDisplayValue(Math.round(eased * value));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration, prefersReduced]);

  return <span className={className}>{formatter(displayValue)}</span>;
}
