"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Warehouse,
  Receipt,
  Tag,
  MessageSquare,
  Truck,
  BarChart3,
  Leaf,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { useSidebarStore } from "@/stores/sidebar-store";

const navigation = [
  { name: "대시보드", href: "/", icon: LayoutDashboard },
  { divider: true, label: "카탈로그 플랫폼" },
  { name: "상품 관리", href: "/catalog/products", icon: Package },
  { divider: true, label: "커스터머 플랫폼" },
  { name: "회원 관리", href: "/customer/members", icon: Users },
  { name: "프로모션", href: "/customer/promotions", icon: Tag },
  { name: "고객의 소리", href: "/customer/voc", icon: MessageSquare },
  { divider: true, label: "인벤토리 플랫폼" },
  { name: "재고 관리", href: "/inventory/stock", icon: Warehouse },
  { name: "배송 관리", href: "/inventory/delivery", icon: Truck },
  { divider: true, label: "세틀먼트 플랫폼" },
  { name: "주문 관리", href: "/settlement/orders", icon: Receipt },
  { name: "정산 관리", href: "/settlement/settlements", icon: BarChart3 },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const {
    isCollapsed,
    toggle: toggleCollapsed,
    setCollapsed: setIsCollapsed,
  } = useSidebarStore();

  useKeyboardShortcut({
    key: "b",
    meta: true,
    handler: toggleCollapsed,
    description: "사이드바 토글",
  });

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  const sidebarContent = (
    <>
      <div
        className={cn(
          "flex h-16 items-center border-b border-gray-200 dark:border-gray-800 transition-all duration-300",
          isCollapsed ? "justify-center px-2" : "justify-between px-5",
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary flex-shrink-0">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Core Platform
              </h1>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                Health & Beauty Commerce
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="메뉴 닫기"
        >
          <X className="h-5 w-5" />
        </button>
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="hidden lg:flex rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="사이드바 접기"
            title="⌘B"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="hidden lg:flex mx-auto mt-2 rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="사이드바 펼치기"
          title="⌘B"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      )}

      <nav
        className={cn(
          "flex flex-col gap-0.5 overflow-y-auto h-[calc(100vh-8rem)]",
          isCollapsed ? "p-2 items-center" : "p-3",
        )}
      >
        {navigation.map((item, idx) => {
          if ("divider" in item && item.divider) {
            if (isCollapsed) {
              return (
                <div
                  key={idx}
                  className="mt-3 mb-1 w-6 border-t border-gray-200 dark:border-gray-800"
                />
              );
            }
            return (
              <div key={idx} className="mt-4 mb-1 px-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {item.label}
                </span>
              </div>
            );
          }
          if ("href" in item) {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            if (isCollapsed) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
                  )}
                  title={item.name}
                >
                  <Icon className="h-4.5 w-4.5" />
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("sidebar-link", isActive && "active")}
              >
                <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          }
          return null;
        })}
      </nav>

      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800",
          isCollapsed ? "p-2 flex justify-center" : "p-4",
        )}
      >
        {isCollapsed ? (
          <div
            className="h-8 w-8 rounded-full bg-brand-primary/20 flex items-center justify-center"
            title="관리자"
          >
            <span className="text-xs font-bold text-brand-primary">관</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-brand-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-brand-primary">관</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                관리자
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                admin@greenmart.co.kr
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden rounded-lg p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        aria-label="메뉴 열기"
      >
        <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      </button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64",
          "lg:translate-x-0",
          isMobileOpen
            ? "translate-x-0 !w-64"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
