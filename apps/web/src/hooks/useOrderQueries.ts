import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  orderApi,
  type OrderListParams,
  type OrderRequestListParams,
  type OrderRequestStatus,
} from "@/lib/api-client";
import type { OrderStatus } from "@greenmart/shared";

export const orderKeys = {
  all: ["orders"] as const,
  list: (params?: OrderListParams) =>
    [...orderKeys.all, "list", params] as const,
  detail: (id: string) => [...orderKeys.all, "detail", id] as const,
  requestList: (params?: OrderRequestListParams) =>
    [...orderKeys.all, "requests", params] as const,
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
 * 고객 주문 요청 큐 조회
 */
export function useOrderRequests(params: OrderRequestListParams = {}) {
  return useQuery({
    queryKey: orderKeys.requestList(params),
    queryFn: () => orderApi.getOrderRequests(params),
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

/**
 * 고객 주문 요청 상태 변경 mutation
 */
export function useUpdateOrderRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderRequestStatus }) =>
      orderApi.updateOrderRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

/**
 * 주문 요청 웹훅 outbox 재시도 mutation
 */
export function useRetryOrderRequestWebhooks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => orderApi.retryOrderRequestWebhooks(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
