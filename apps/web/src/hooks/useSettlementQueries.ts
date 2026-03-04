import { useQuery } from "@tanstack/react-query";
import { settlementApi, type SettlementListParams } from "@/lib/api-client";

export const settlementKeys = {
  all: ["settlement"] as const,
  list: (params?: SettlementListParams) =>
    [...settlementKeys.all, "list", params] as const,
  dashboard: () => [...settlementKeys.all, "dashboard"] as const,
};

/** 정산 내역 조회 */
export function useSettlements(params: SettlementListParams = {}) {
  return useQuery({
    queryKey: settlementKeys.list(params),
    queryFn: () => settlementApi.getSettlements(params),
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
