"use client";

import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      {/* Animated 404 */}
      <div className="relative mb-8">
        <span className="text-[160px] font-black text-gray-100 dark:text-gray-900 leading-none select-none">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-2xl bg-brand-primary/10 dark:bg-brand-primary/20 p-5 backdrop-blur-sm">
            <Search className="h-10 w-10 text-brand-primary animate-bounce-subtle" />
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 text-center max-w-md">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
        <br />
        URL을 확인하거나 아래 링크를 이용해 주세요.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="btn-outline gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          뒤로 가기
        </button>
        <Link href="/" className="btn-primary gap-2">
          <Home className="h-4 w-4" />
          대시보드로 이동
        </Link>
      </div>

      {/* 키보드 힌트 */}
      <p className="mt-8 text-xs text-gray-400 dark:text-gray-600">
        <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-[10px]">
          ⌘K
        </kbd>{" "}
        를 눌러 원하는 페이지로 빠르게 이동할 수 있습니다
      </p>
    </div>
  );
}
