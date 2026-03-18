"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface AnnouncerContextType {
  announce: (message: string, priority?: "polite" | "assertive") => void;
}

const AnnouncerContext = createContext<AnnouncerContextType>({
  announce: () => {},
});

/**
 * 스크린 리더에 동적 메시지를 전달하는 ARIA Live Region Provider
 * - 페이지 전환, 데이터 로딩 완료, 에러 알림 등에 사용
 */
export function AriaAnnouncerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");

  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      if (priority === "assertive") {
        setAssertiveMessage("");
        requestAnimationFrame(() => setAssertiveMessage(message));
      } else {
        setPoliteMessage("");
        requestAnimationFrame(() => setPoliteMessage(message));
      }
    },
    [],
  );

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}
      {/* ARIA Live Regions - 시각적으로 숨기지만 스크린 리더가 읽음 */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </AnnouncerContext.Provider>
  );
}

export function useAnnounce() {
  return useContext(AnnouncerContext);
}
