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
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  // 라우트 변경 시 모바일 사이드바 닫기
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // 모바일 메뉴 열려 있을 때 스크롤 방지
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
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">Core Platform</h1>
            <p className="text-[10px] text-gray-400">
              Health & Beauty Commerce
            </p>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="메뉴 닫기"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 p-3 overflow-y-auto h-[calc(100vh-8rem)]">
        {navigation.map((item, idx) => {
          if ("divider" in item && item.divider) {
            return (
              <div key={idx} className="mt-4 mb-1 px-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
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

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-brand-primary/20 flex items-center justify-center">
            <span className="text-xs font-bold text-brand-primary">관</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700">관리자</p>
            <p className="text-[10px] text-gray-400">admin@greenmart.co.kr</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden rounded-lg p-2 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
        aria-label="메뉴 열기"
      >
        <Menu className="h-5 w-5 text-gray-600" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop: always visible, Mobile: slide-in */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
