import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogApi, type ProductListParams } from "@/lib/api-client";
import type { ProductFormData } from "@greenmart/shared";

export const catalogKeys = {
  all: ["catalog"] as const,
  products: (params?: ProductListParams) =>
    [...catalogKeys.all, "products", params] as const,
  product: (id: string) => [...catalogKeys.all, "product", id] as const,
  categories: () => [...catalogKeys.all, "categories"] as const,
  brands: () => [...catalogKeys.all, "brands"] as const,
};

/**
 * 상품 목록 조회 (필터, 페이지네이션)
 */
export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: catalogKeys.products(params),
    queryFn: () => catalogApi.getProducts(params),
  });
}

/**
 * 상품 상세 조회
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: catalogKeys.product(id),
    queryFn: () => catalogApi.getProductById(id),
    enabled: !!id,
  });
}

/**
 * 카테고리 목록 조회
 */
export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: () => catalogApi.getCategories(),
    staleTime: 5 * 60 * 1000, // 5분 캐시
  });
}

/**
 * 브랜드 목록 조회
 */
export function useBrands() {
  return useQuery({
    queryKey: catalogKeys.brands(),
    queryFn: () => catalogApi.getBrands(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 상품 등록 mutation
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductFormData) => catalogApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
    },
  });
}

/**
 * 상품 수정 mutation
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductFormData }) =>
      catalogApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
    },
  });
}

/**
 * 상품 삭제 mutation
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => catalogApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
    },
  });
}
