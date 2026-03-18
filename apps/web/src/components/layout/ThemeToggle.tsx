"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

export default function ThemeToggle() {
  const { resolvedTheme, toggle, mounted } = useTheme();

  useKeyboardShortcut({
    key: "d",
    meta: true,
    handler: toggle,
    description: "다크/라이트 모드 전환",
  });

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggle}
      className="relative rounded-lg p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
      aria-label={
        resolvedTheme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"
      }
      title="⌘D"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-5 w-5 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="h-5 w-5 transition-transform duration-300 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
