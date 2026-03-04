import { useQuery } from "@tanstack/react-query";
import { promotionApi, type VocListParams } from "@/lib/api-client";

export const promotionKeys = {
  all: ["promotions"] as const,
  list: (activeOnly?: boolean) =>
    [...promotionKeys.all, "list", activeOnly] as const,
  coupons: () => [...promotionKeys.all, "coupons"] as const,
  voc: (params?: VocListParams) =>
    [...promotionKeys.all, "voc", params] as const,
};

/** 프로모션 목록 조회 */
export function usePromotions(activeOnly = false) {
  return useQuery({
    queryKey: promotionKeys.list(activeOnly),
    queryFn: () => promotionApi.getPromotions(activeOnly),
  });
}

/** 쿠폰 목록 조회 */
export function useCoupons() {
  return useQuery({
    queryKey: promotionKeys.coupons(),
    queryFn: () => promotionApi.getCoupons(),
  });
}

/** VOC 목록 조회 */
export function useVoc(params: VocListParams = {}) {
  return useQuery({
    queryKey: promotionKeys.voc(params),
    queryFn: () => promotionApi.getVoc(params),
  });
}
