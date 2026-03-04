"use client";

import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="rounded-full bg-red-100 p-4 mb-4">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">
        문제가 발생했습니다
      </h2>
      <p className="text-sm text-gray-500 mb-1 text-center max-w-md">
        {error.message ||
          "예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요."}
      </p>
      {error.digest && (
        <p className="text-xs text-gray-400 mb-4">오류 코드: {error.digest}</p>
      )}
      <button onClick={reset} className="btn-primary mt-2">
        다시 시도
      </button>
    </div>
  );
}
