"use client";

import { useEffect, useState } from "react";
import { X, Command } from "lucide-react";
import { useKeyboardShortcut } from "@/hooks";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const shortcuts = [
  { keys: ["⌘", "K"], description: "커맨드 팔레트 열기" },
  { keys: ["⌘", "D"], description: "다크 모드 토글" },
  { keys: ["⌘", "/"], description: "단축키 도움말" },
  { keys: ["⌘", "B"], description: "사이드바 토글" },
  { keys: ["/"], description: "검색 포커스" },
  { keys: ["Esc"], description: "팝업 닫기" },
  { keys: ["↑", "↓"], description: "목록 탐색" },
  { keys: ["Enter"], description: "선택 / 확인" },
];

/**
 * 키보드 단축키 도움말 모달
 * ⌘/ 로 열 수 있음
 */
export function ShortcutHelpModal() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useFocusTrap<HTMLDivElement>(isOpen);

  useKeyboardShortcut({
    key: "/",
    meta: true,
    handler: () => setIsOpen((prev) => !prev),
    description: "키보드 단축키 도움말",
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      <div
        ref={containerRef}
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcut-help-title"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10">
              <Command className="h-4 w-4 text-brand-primary" />
            </div>
            <h2
              id="shortcut-help-title"
              className="text-sm font-bold text-gray-900 dark:text-gray-100"
            >
              키보드 단축키
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3">
          {shortcuts.map((shortcut, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key) => (
                  <kbd
                    key={key}
                    className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-1.5 text-[11px] font-mono font-medium text-gray-600 dark:text-gray-400"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[10px] text-center text-gray-400 dark:text-gray-500">
            macOS에서 ⌘ = Command, Windows에서 ⌘ = Ctrl
          </p>
        </div>
      </div>
    </div>
  );
}
