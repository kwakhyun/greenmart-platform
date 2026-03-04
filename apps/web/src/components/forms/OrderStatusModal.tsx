"use client";

import { useState } from "react";
import { Modal } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { useUpdateOrderStatus } from "@/hooks";
import { Loader2 } from "lucide-react";
import type { Order, OrderStatus } from "@greenmart/shared";
import { cn, getOrderStatusLabel, getStatusColor } from "@/lib/utils";

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const STATUS_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export function OrderStatusModal({
  isOpen,
  onClose,
  order,
}: OrderStatusModalProps) {
  const updateStatus = useUpdateOrderStatus();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const { toast } = useToast();

  if (!order) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStatus || !order) return;

    try {
      await updateStatus.mutateAsync({
        id: order.id,
        status: selectedStatus,
      });
      toast("success", "주문 상태가 변경되었습니다.");
      onClose();
      setSelectedStatus("");
    } catch {
      toast("error", "주문 상태 변경에 실패했습니다.");
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="주문 상태 변경"
      description={`주문번호: ${order.orderNumber}`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-3">
            현재 상태:{" "}
            <span className={cn("badge", getStatusColor(order.status))}>
              {getOrderStatusLabel(order.status)}
            </span>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            변경할 상태
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_FLOW.map((status) => (
              <button
                key={status}
                type="button"
                disabled={status === order.status}
                onClick={() => setSelectedStatus(status)}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-medium border transition-colors",
                  status === order.status
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : selectedStatus === status
                      ? "bg-brand-primary text-white border-brand-primary"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
                )}
              >
                {getOrderStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button type="button" onClick={onClose} className="btn-secondary">
            취소
          </button>
          <button
            type="submit"
            disabled={!selectedStatus || updateStatus.isPending}
            className="btn-primary disabled:opacity-50"
          >
            {updateStatus.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> 변경 중...
              </>
            ) : (
              "상태 변경"
            )}
          </button>
        </div>

        {updateStatus.isError && (
          <p className="text-xs text-red-500 text-center">
            상태 변경에 실패했습니다.
          </p>
        )}
      </form>
    </Modal>
  );
}
