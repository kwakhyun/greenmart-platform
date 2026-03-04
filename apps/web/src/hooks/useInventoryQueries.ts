import { useQuery } from "@tanstack/react-query";
import {
  inventoryApi,
  type StockListParams,
  type DeliveryListParams,
} from "@/lib/api-client";

export const inventoryKeys = {
  all: ["inventory"] as const,
  warehouses: () => [...inventoryKeys.all, "warehouses"] as const,
  stock: (params?: StockListParams) =>
    [...inventoryKeys.all, "stock", params] as const,
  deliveries: (params?: DeliveryListParams) =>
    [...inventoryKeys.all, "deliveries", params] as const,
  delivery: (id: string) => [...inventoryKeys.all, "delivery", id] as const,
};

/** 창고 목록 조회 */
export function useWarehouses() {
  return useQuery({
    queryKey: inventoryKeys.warehouses(),
    queryFn: () => inventoryApi.getWarehouses(),
    staleTime: 5 * 60 * 1000,
  });
}

/** 재고 목록 조회 */
export function useStock(params: StockListParams = {}) {
  return useQuery({
    queryKey: inventoryKeys.stock(params),
    queryFn: () => inventoryApi.getStock(params),
  });
}

/** 배송 목록 조회 */
export function useDeliveries(params: DeliveryListParams = {}) {
  return useQuery({
    queryKey: inventoryKeys.deliveries(params),
    queryFn: () => inventoryApi.getDeliveries(params),
  });
}

/** 배송 상세 조회 */
export function useDelivery(id: string) {
  return useQuery({
    queryKey: inventoryKeys.delivery(id),
    queryFn: () => inventoryApi.getDeliveryById(id),
    enabled: !!id,
  });
}
