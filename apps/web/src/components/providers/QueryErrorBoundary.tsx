"use client";

import { Component, type ReactNode } from "react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryInner extends Component<
  ErrorBoundaryProps & { onReset: () => void },
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps & { onReset: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.props.onReset();
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] p-6">
          <div className="rounded-full bg-red-100 p-4 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">
            데이터를 불러오지 못했습니다
          </h3>
          <p className="text-sm text-gray-500 mb-4 text-center max-w-sm">
            {this.state.error?.message ||
              "네트워크 오류가 발생했습니다. 다시 시도해주세요."}
          </p>
          <button
            onClick={this.handleReset}
            className="btn-primary inline-flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            다시 시도
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * TanStack Query의 에러 리셋과 React Error Boundary를 통합한 컴포넌트
 *
 * - 쿼리 에러 발생 시 fallback UI 표시
 * - "다시 시도" 클릭 시 실패한 쿼리를 자동으로 재시도
 * - 커스텀 fallback 지원
 */
export function QueryErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundaryInner onReset={reset} fallback={fallback}>
          {children}
        </ErrorBoundaryInner>
      )}
    </QueryErrorResetBoundary>
  );
}
