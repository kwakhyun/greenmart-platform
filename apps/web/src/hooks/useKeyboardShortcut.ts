"use client";

import { useEffect, useCallback } from "react";

interface ShortcutConfig {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  handler: () => void;
  description: string;
}

const registeredShortcuts: ShortcutConfig[] = [];

export function useKeyboardShortcut(config: ShortcutConfig) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      const metaMatch = config.meta ? e.metaKey || e.ctrlKey : true;
      const ctrlMatch = config.ctrl ? e.ctrlKey : true;
      const shiftMatch = config.shift ? e.shiftKey : !e.shiftKey;

      if (metaMatch && ctrlMatch && shiftMatch && e.key === config.key) {
        e.preventDefault();
        config.handler();
      }
    },
    [config],
  );

  useEffect(() => {
    registeredShortcuts.push(config);
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      const idx = registeredShortcuts.indexOf(config);
      if (idx !== -1) registeredShortcuts.splice(idx, 1);
    };
  }, [config, handler]);
}

export function getRegisteredShortcuts(): ShortcutConfig[] {
  return [...registeredShortcuts];
}
