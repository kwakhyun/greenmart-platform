import { useState, useMemo, useCallback } from "react";

interface UsePaginationOptions {
  totalItems: number;
  pageSize?: number;
  initialPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  startIndex: number;
  endIndex: number;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  paginatedItems: (items: T[]) => T[];
  canGoNext: boolean;
  canGoPrev: boolean;
}

/**
 * 페이지네이션 로직을 추상화한 커스텀 훅
 */
export function usePagination<T = unknown>({
  totalItems,
  pageSize = 10,
  initialPage = 1,
}: UsePaginationOptions): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / pageSize)),
    [totalItems, pageSize],
  );

  const setPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages],
  );

  const nextPage = useCallback(
    () => setPage(currentPage + 1),
    [currentPage, setPage],
  );
  const prevPage = useCallback(
    () => setPage(currentPage - 1),
    [currentPage, setPage],
  );

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedItems = useCallback(
    (items: T[]) => items.slice(startIndex, endIndex),
    [startIndex, endIndex],
  );

  return {
    currentPage,
    totalPages,
    pageSize,
    startIndex,
    endIndex,
    setPage,
    nextPage,
    prevPage,
    paginatedItems,
    canGoNext: currentPage < totalPages,
    canGoPrev: currentPage > 1,
  };
}
