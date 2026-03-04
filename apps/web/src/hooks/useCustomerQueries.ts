import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi, type MemberListParams } from "@/lib/api-client";
import type { CustomerFormData } from "@greenmart/shared";

export const customerKeys = {
  all: ["customer"] as const,
  members: (params?: MemberListParams) =>
    [...customerKeys.all, "members", params] as const,
  member: (id: string) => [...customerKeys.all, "member", id] as const,
};

/**
 * 회원 목록 조회 (필터, 페이지네이션)
 */
export function useMembers(params: MemberListParams = {}) {
  return useQuery({
    queryKey: customerKeys.members(params),
    queryFn: () => customerApi.getMembers(params),
  });
}

/**
 * 회원 상세 조회
 */
export function useMember(id: string) {
  return useQuery({
    queryKey: customerKeys.member(id),
    queryFn: () => customerApi.getMemberById(id),
    enabled: !!id,
  });
}

/**
 * 회원 등록 mutation
 */
export function useCreateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CustomerFormData) => customerApi.createMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}

/**
 * 회원 삭제 mutation
 */
export function useDeleteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerApi.deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}
