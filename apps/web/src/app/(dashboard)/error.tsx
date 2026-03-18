"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅 (프로덕션에서는 Sentry 등으로 전송)
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-red-500/20 dark:bg-red-500/10 blur-xl animate-pulse-slow" />
        <div className="relative rounded-full bg-red-100 dark:bg-red-900/30 p-5">
          <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        문제가 발생했습니다
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 text-center max-w-md">
        {error.message ||
          "예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요."}
      </p>
      {error.digest && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-6 font-mono">
          Error ID: {error.digest}
        </p>
      )}

      <div className="flex items-center gap-3 mt-2">
        <button onClick={reset} className="btn-primary gap-2">
          <RefreshCw className="h-4 w-4" />
          다시 시도
        </button>
        <Link href="/" className="btn-outline gap-2">
          <Home className="h-4 w-4" />
          대시보드
        </Link>
      </div>
    </div>
  );
}
