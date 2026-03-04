"use client";

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
  Settings,
  Leaf,
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

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-gray-200 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary">
          <Leaf className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-gray-900">Core Platform</h1>
          <p className="text-[10px] text-gray-400">Health & Beauty Commerce</p>
        </div>
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
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-3">
        <Link href="/settings" className="sidebar-link">
          <Settings className="h-4.5 w-4.5" />
          <span>설정</span>
        </Link>
      </div>
    </aside>
  );
}
