import { useQuery } from "@tanstack/react-query";
import { settlementApi, type SettlementListParams } from "@/lib/api-client";

export const settlementKeys = {
  all: ["settlement"] as const,
  list: (params?: SettlementListParams) =>
    [...settlementKeys.all, "list", params] as const,
  detail: (id: string) => [...settlementKeys.all, "detail", id] as const,
  dashboard: () => [...settlementKeys.all, "dashboard"] as const,
};

/** 정산 내역 조회 */
export function useSettlements(params: SettlementListParams = {}) {
  return useQuery({
    queryKey: settlementKeys.list(params),
    queryFn: () => settlementApi.getSettlements(params),
  });
}

/** 정산 상세 조회 */
export function useSettlement(id: string) {
  return useQuery({
    queryKey: settlementKeys.detail(id),
    queryFn: () => settlementApi.getSettlement(id),
    enabled: !!id,
  });
}

/** 대시보드 요약 조회 */
export function useDashboard() {
  return useQuery({
    queryKey: settlementKeys.dashboard(),
    queryFn: () => settlementApi.getDashboard(),
    staleTime: 60 * 1000, // 1분 캐시
  });
}
