import { useQuery } from "@tanstack/react-query";
import { promotionApi, type VocListParams } from "@/lib/api-client";

export const promotionKeys = {
  all: ["promotions"] as const,
  list: (activeOnly?: boolean) =>
    [...promotionKeys.all, "list", activeOnly] as const,
  detail: (id: string) => [...promotionKeys.all, "detail", id] as const,
  coupons: () => [...promotionKeys.all, "coupons"] as const,
  voc: (params?: VocListParams) =>
    [...promotionKeys.all, "voc", params] as const,
  vocDetail: (id: string) =>
    [...promotionKeys.all, "voc", "detail", id] as const,
};

/** 프로모션 목록 조회 */
export function usePromotions(activeOnly = false) {
  return useQuery({
    queryKey: promotionKeys.list(activeOnly),
    queryFn: () => promotionApi.getPromotions(activeOnly),
  });
}

/** 프로모션 상세 조회 */
export function usePromotion(id: string) {
  return useQuery({
    queryKey: promotionKeys.detail(id),
    queryFn: () => promotionApi.getPromotion(id),
    enabled: !!id,
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

/** VOC 상세 조회 */
export function useVocItem(id: string) {
  return useQuery({
    queryKey: promotionKeys.vocDetail(id),
    queryFn: () => promotionApi.getVocItem(id),
    enabled: !!id,
  });
}
