"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Package,
  AlertTriangle,
  Users,
  ShoppingCart,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "order" | "stock" | "member" | "system";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const typeConfig = {
  order: {
    icon: ShoppingCart,
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  },
  stock: {
    icon: AlertTriangle,
    color:
      "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
  },
  member: {
    icon: Users,
    color:
      "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
  },
  system: {
    icon: Package,
    color: "text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400",
  },
};

const mockNotifications: Notification[] = [
  {
    id: "n1",
    type: "order",
    title: "새 주문 접수",
    message: "주문번호 GMF-2026-0624-007이 접수되었습니다.",
    time: "2분 전",
    isRead: false,
  },
  {
    id: "n2",
    type: "stock",
    title: "재고 부족 경고",
    message: "주간 식단 루틴 박스의 가용 재고가 5개 미만입니다.",
    time: "15분 전",
    isRead: false,
  },
  {
    id: "n3",
    type: "member",
    title: "신규 회원 가입",
    message: "김민지 님이 회원 가입했습니다.",
    time: "1시간 전",
    isRead: false,
  },
  {
    id: "n4",
    type: "order",
    title: "환불 요청",
    message: "주문번호 GMF-2026-0623-004에 대한 환불 요청이 접수되었습니다.",
    time: "2시간 전",
    isRead: true,
  },
  {
    id: "n5",
    type: "system",
    title: "시스템 업데이트",
    message: "v1.2.0 업데이트가 적용되었습니다.",
    time: "3시간 전",
    isRead: true,
  },
];

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  function dismissNotification(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
        aria-label={`알림 ${unreadCount}개`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden z-50 animate-slide-down">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              알림
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-brand-primary font-medium hover:underline"
              >
                모두 읽음 처리
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="h-8 w-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  알림이 없습니다
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const config = typeConfig[notification.type];
                const Icon = config.icon;
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-b-0 transition-colors",
                      !notification.isRead &&
                        "bg-blue-50/50 dark:bg-blue-950/20",
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-lg p-1.5 mt-0.5 flex-shrink-0",
                        config.color,
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                        {notification.time}
                      </p>
                    </div>
                    <button
                      onClick={() => dismissNotification(notification.id)}
                      className="p-1 text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 rounded transition-colors flex-shrink-0"
                      aria-label="알림 삭제"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
