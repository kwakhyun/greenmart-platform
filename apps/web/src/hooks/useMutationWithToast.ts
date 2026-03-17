import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { useToast } from "@/components/ui/Toast";
import { ApiClientError } from "@/lib/api-client";

interface MutationWithToastOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  successMessage: string;
  errorMessage?: string;
  invalidateKeys?: readonly unknown[][];
  onSuccessCallback?: (data: TData) => void;
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">;
}

/**
 * Toast 알림이 자동 연동되는 Mutation 훅
 *
 * - 성공 시 success Toast + 쿼리 무효화
 * - 실패 시 error Toast (ApiClientError면 서버 메시지, 아니면 기본 메시지)
 */
export function useMutationWithToast<TData, TVariables>({
  mutationFn,
  successMessage,
  errorMessage = "요청 처리 중 오류가 발생했습니다.",
  invalidateKeys = [],
  onSuccessCallback,
  options,
}: MutationWithToastOptions<TData, TVariables>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: (data) => {
      toast("success", successMessage);
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      onSuccessCallback?.(data);
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError ? error.message : errorMessage;
      toast("error", message);
    },
    ...options,
  });
}
