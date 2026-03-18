"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

/**
 * 페이지 전환 시 부드러운 fade + slide 애니메이션
 * Next.js App Router 환경에서 동작
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [displayChildren, setDisplayChildren] = useState(children);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      setIsVisible(false);

      const timeout = setTimeout(() => {
        setDisplayChildren(children);
        setIsVisible(true);
        prevPathRef.current = pathname;
      }, 150);

      return () => clearTimeout(timeout);
    } else {
      setDisplayChildren(children);
    }
  }, [pathname, children]);

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      }`}
    >
      {displayChildren}
    </div>
  );
}
