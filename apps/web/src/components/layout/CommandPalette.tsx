"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Package,
  Users,
  Receipt,
  Warehouse,
  Truck,
  Tag,
  MessageSquare,
  BarChart3,
  Moon,
  Sun,
  Keyboard,
  PanelLeftClose,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { useSidebarStore } from "@/stores/sidebar-store";

interface CommandItem {
  id: string;
  label: string;
  category: string;
  icon: React.ElementType;
  action: () => void;
  keywords?: string[];
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toggle, resolvedTheme } = useTheme();
  const toggleSidebar = useSidebarStore((s) => s.toggle);

  useKeyboardShortcut({
    key: "k",
    meta: true,
    handler: () => setIsOpen(true),
    description: "커맨드 팔레트 열기",
  });

  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: "dashboard",
        label: "대시보드",
        category: "페이지",
        icon: LayoutDashboard,
        action: () => router.push("/"),
        keywords: ["홈", "home", "dashboard"],
      },
      {
        id: "products",
        label: "상품 관리",
        category: "페이지",
        icon: Package,
        action: () => router.push("/catalog/products"),
        keywords: ["카탈로그", "catalog", "product"],
      },
      {
        id: "members",
        label: "회원 관리",
        category: "페이지",
        icon: Users,
        action: () => router.push("/customer/members"),
        keywords: ["고객", "customer", "member"],
      },
      {
        id: "promotions",
        label: "프로모션",
        category: "페이지",
        icon: Tag,
        action: () => router.push("/customer/promotions"),
        keywords: ["쿠폰", "할인", "promotion"],
      },
      {
        id: "voc",
        label: "고객의 소리",
        category: "페이지",
        icon: MessageSquare,
        action: () => router.push("/customer/voc"),
        keywords: ["VOC", "문의", "불만"],
      },
      {
        id: "stock",
        label: "재고 관리",
        category: "페이지",
        icon: Warehouse,
        action: () => router.push("/inventory/stock"),
        keywords: ["인벤토리", "inventory", "재고"],
      },
      {
        id: "delivery",
        label: "배송 관리",
        category: "페이지",
        icon: Truck,
        action: () => router.push("/inventory/delivery"),
        keywords: ["택배", "shipping"],
      },
      {
        id: "orders",
        label: "주문 관리",
        category: "페이지",
        icon: Receipt,
        action: () => router.push("/settlement/orders"),
        keywords: ["order", "결제"],
      },
      {
        id: "settlements",
        label: "정산 관리",
        category: "페이지",
        icon: BarChart3,
        action: () => router.push("/settlement/settlements"),
        keywords: ["settlement", "매출"],
      },
      {
        id: "toggle-theme",
        label:
          resolvedTheme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환",
        category: "설정",
        icon: resolvedTheme === "dark" ? Sun : Moon,
        action: toggle,
        keywords: ["theme", "dark", "light", "테마"],
      },
      {
        id: "toggle-sidebar",
        label: "사이드바 토글",
        category: "설정",
        icon: PanelLeftClose,
        action: toggleSidebar,
        keywords: ["sidebar", "메뉴", "접기", "펼치기"],
      },
      {
        id: "shortcuts",
        label: "키보드 단축키 보기",
        category: "설정",
        icon: Keyboard,
        action: () => {},
        keywords: ["shortcut", "단축키", "help"],
      },
    ],
    [router, toggle, resolvedTheme, toggleSidebar],
  );

  const filtered = useMemo(() => {
    if (!query) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q) ||
        cmd.keywords?.some((kw) => kw.toLowerCase().includes(q)),
    );
  }, [query, commands]);

  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filtered.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filtered]);

  const flatList = useMemo(() => filtered, [filtered]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const activeEl = listRef.current?.querySelector(
      `[data-index="${activeIndex}"]`,
    );
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const executeCommand = useCallback((cmd: CommandItem) => {
    setIsOpen(false);
    cmd.action();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => (prev < flatList.length - 1 ? prev + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : flatList.length - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (flatList[activeIndex]) executeCommand(flatList[activeIndex]);
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    },
    [flatList, activeIndex, executeCommand],
  );

  if (!isOpen) return null;

  let globalIdx = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-slide-down">
        <div className="flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-700">
          <Search className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="명령어 검색..."
            className="flex-1 h-14 bg-transparent text-sm text-gray-900 dark:text-gray-100 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-mono text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {flatList.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                &quot;{query}&quot;에 대한 명령어가 없습니다
              </p>
            </div>
          )}

          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {category}
              </p>
              {items.map((cmd) => {
                globalIdx++;
                const idx = globalIdx;
                const Icon = cmd.icon;
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={cmd.id}
                    data-index={idx}
                    onClick={() => executeCommand(cmd)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{cmd.label}</span>
                    {cmd.id === "toggle-theme" && (
                      <kbd className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
                        ⌘D
                      </kbd>
                    )}
                    {cmd.id === "toggle-sidebar" && (
                      <kbd className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
                        ⌘B
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-[10px] text-gray-400 dark:text-gray-500">
          <span>↑↓ 이동</span>
          <span>↵ 실행</span>
          <span>ESC 닫기</span>
          <span className="ml-auto font-mono">⌘K</span>
        </div>
      </div>
    </div>
  );
}
