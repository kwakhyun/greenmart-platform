import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi, type OrderListParams } from "@/lib/api-client";
import type { OrderStatus } from "@greenmart/shared";

export const orderKeys = {
  all: ["orders"] as const,
  list: (params?: OrderListParams) =>
    [...orderKeys.all, "list", params] as const,
  detail: (id: string) => [...orderKeys.all, "detail", id] as const,
};

/**
 * 주문 목록 조회
 */
export function useOrders(params: OrderListParams = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderApi.getOrders(params),
  });
}

/**
 * 주문 상세 조회
 */
export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderApi.getOrderById(id),
    enabled: !!id,
  });
}

/**
 * 주문 상태 변경 mutation
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      orderApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
