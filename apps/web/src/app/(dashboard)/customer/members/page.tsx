"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import { useMembers, useDeleteMember, useDebounce } from "@/hooks";
import {
  cn,
  getMemberGradeLabel,
  formatCurrency,
  formatDateTime,
  getStatusColor,
} from "@/lib/utils";
import { Search, Download, UserPlus, Trash2, Loader2 } from "lucide-react";
import { GRADE_COLORS } from "@/lib/constants";
import { CustomerFormModal, ConfirmDeleteModal } from "@/components/forms";
import { useToast } from "@/components/ui/Toast";
import { exportToCSV } from "@/lib/export-excel";

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  const deleteMember = useDeleteMember();
  const { toast } = useToast();

  const { data, isLoading, isError, error } = useMembers({
    page,
    size: 20,
    search: debouncedSearch || undefined,
    grade: gradeFilter || undefined,
  });

  const filtered = data?.items ?? [];
  const gradeCounts = data?.summary ?? {
    total: 0,
    PLATINUM: 0,
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
  };

  return (
    <>
      <Header
        title="회원 관리"
        description="커스터머 플랫폼 · 온/오프라인 회원 통합 관리"
      />
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Grade Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            {
              label: "전체 회원",
              count: gradeCounts.total,
              color: "bg-gray-900 text-white",
            },
            {
              label: "플래티넘",
              count: gradeCounts.PLATINUM,
              color: "bg-purple-500 text-white",
            },
            {
              label: "골드",
              count: gradeCounts.GOLD,
              color: "bg-yellow-500 text-white",
            },
            {
              label: "실버",
              count: gradeCounts.SILVER,
              color: "bg-green-500 text-white",
            },
            {
              label: "브론즈",
              count: gradeCounts.BRONZE,
              color: "bg-gray-400 text-white",
            },
          ].map((item) => (
            <div key={item.label} className="card p-4 flex items-center gap-3">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold",
                  item.color,
                )}
              >
                {item.count}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="이름, 이메일 검색..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input-field pl-9"
              aria-label="회원 검색"
            />
          </div>
          <select
            value={gradeFilter}
            onChange={(e) => {
              setGradeFilter(e.target.value);
              setPage(1);
            }}
            className="input-field w-40"
            aria-label="등급 필터"
          >
            <option value="">전체 등급</option>
            <option value="PLATINUM">플래티넘</option>
            <option value="GOLD">골드</option>
            <option value="SILVER">실버</option>
            <option value="BRONZE">브론즈</option>
          </select>
          <button
            className="btn-secondary"
            onClick={() => {
              if (filtered.length === 0) return;
              exportToCSV(
                filtered,
                [
                  { header: "이름", accessor: (m) => m.name },
                  { header: "이메일", accessor: (m) => m.email },
                  {
                    header: "등급",
                    accessor: (m) => getMemberGradeLabel(m.grade),
                  },
                  {
                    header: "상태",
                    accessor: (m) =>
                      m.status === "ACTIVE"
                        ? "활성"
                        : m.status === "DORMANT"
                          ? "휴면"
                          : "탈퇴",
                  },
                  { header: "가입 채널", accessor: (m) => m.joinChannel },
                  { header: "포인트", accessor: (m) => m.points },
                  {
                    header: "총 구매액",
                    accessor: (m) => m.totalPurchaseAmount,
                  },
                  { header: "총 주문", accessor: (m) => m.totalOrders },
                ],
                "회원목록",
              );
              toast("success", "회원 목록이 다운로드되었습니다.");
            }}
          >
            <Download className="h-4 w-4 mr-1" /> 내보내기
          </button>
          <button className="btn-primary" onClick={() => setIsFormOpen(true)}>
            <UserPlus className="h-4 w-4 mr-1" /> 회원 등록
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="card p-16 text-center">
            <Loader2 className="h-8 w-8 text-brand-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">회원 정보를 불러오는 중...</p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="card p-16 text-center">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              데이터를 불러오지 못했습니다
            </h3>
            <p className="text-xs text-gray-500">
              {error instanceof Error
                ? error.message
                : "잠시 후 다시 시도해주세요."}
            </p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !isError && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="table-header">회원</th>
                    <th className="table-header">등급</th>
                    <th className="table-header">상태</th>
                    <th className="table-header">가입 채널</th>
                    <th className="table-header">포인트</th>
                    <th className="table-header">총 구매액</th>
                    <th className="table-header">총 주문</th>
                    <th className="table-header">최근 로그인</th>
                    <th className="table-header">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-gray-50 hover:bg-gray-50/80"
                    >
                      <td className="table-cell">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {customer.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {customer.email}
                          </p>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span
                          className={cn("badge", GRADE_COLORS[customer.grade])}
                        >
                          {getMemberGradeLabel(customer.grade)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span
                          className={cn(
                            "badge",
                            getStatusColor(customer.status),
                          )}
                        >
                          {customer.status === "ACTIVE"
                            ? "활성"
                            : customer.status === "DORMANT"
                              ? "휴면"
                              : "탈퇴"}
                        </span>
                      </td>
                      <td className="table-cell text-sm">
                        {customer.joinChannel}
                      </td>
                      <td className="table-cell text-sm font-medium">
                        {customer.points.toLocaleString()}P
                      </td>
                      <td className="table-cell text-sm font-medium">
                        {formatCurrency(customer.totalPurchaseAmount)}
                      </td>
                      <td className="table-cell text-sm">
                        {customer.totalOrders}건
                      </td>
                      <td className="table-cell text-xs text-gray-500">
                        {formatDateTime(customer.lastLoginAt)}
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              id: customer.id,
                              name: customer.name,
                            })
                          }
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="회원 삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="table-cell text-center text-gray-400 py-12"
                      >
                        검색 결과가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Customer Form Modal */}
      <CustomerFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />

      {/* Delete Confirm Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            try {
              await deleteMember.mutateAsync(deleteTarget.id);
              toast("success", "회원이 삭제되었습니다.");
              setDeleteTarget(null);
            } catch {
              toast("error", "회원 삭제에 실패했습니다.");
            }
          }
        }}
        title="회원 삭제"
        description={`"${deleteTarget?.name}" 회원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        isPending={deleteMember.isPending}
      />
    </>
  );
}
