"use client";

import { Bell, Search } from "lucide-react";

interface HeaderProps {
  title: string;
  description?: string;
}

export default function Header({ title, description }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-6">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="통합 검색..."
              className="h-9 w-64 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary/30"
            />
          </div>

          {/* Notifications */}
          <button className="relative rounded-lg p-2 hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5 text-gray-500" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-brand-accent" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5">
            <div className="h-7 w-7 rounded-full bg-brand-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-brand-primary">관</span>
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-gray-900">관리자</p>
              <p className="text-[10px] text-gray-400">Core Platform</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
