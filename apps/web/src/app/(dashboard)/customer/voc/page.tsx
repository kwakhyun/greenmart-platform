"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import { useVoc } from "@/hooks";
import { cn, formatDateTime, getStatusColor } from "@/lib/utils";
import {
  MessageCircle,
  AlertTriangle,
  Lightbulb,
  Heart,
  Clock,
  Loader2,
} from "lucide-react";
import Link from "next/link";

const typeConfig: Record<
  string,
  { icon: typeof MessageCircle; label: string; color: string }
> = {
  INQUIRY: {
    icon: MessageCircle,
    label: "문의",
    color: "bg-blue-100 text-blue-700",
  },
  COMPLAINT: {
    icon: AlertTriangle,
    label: "불만",
    color: "bg-red-100 text-red-700",
  },
  SUGGESTION: {
    icon: Lightbulb,
    label: "제안",
    color: "bg-yellow-100 text-yellow-700",
  },
  COMPLIMENT: {
    icon: Heart,
    label: "칭찬",
    color: "bg-green-100 text-green-700",
  },
};

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  PENDING: "대기",
  IN_PROGRESS: "처리 중",
  RESOLVED: "해결",
  CLOSED: "완료",
};

export default function VocPage() {
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useVoc({
    type: typeFilter || undefined,
    status: statusFilter || undefined,
  });

  const vocList = data?.items ?? [];
  const stats = data?.summary ?? {
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  };

  return (
    <>
      <Header
        title="고객의 소리 (VOC)"
        description="커스터머 플랫폼 · 고객 소통 시스템"
      />
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "전체", value: stats.total, color: "text-gray-900" },
            { label: "대기", value: stats.pending, color: "text-yellow-600" },
            {
              label: "처리 중",
              value: stats.inProgress,
              color: "text-blue-600",
            },
            {
              label: "해결/완료",
              value: stats.resolved,
              color: "text-green-600",
            },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card p-4 flex flex-wrap items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field w-36"
            aria-label="유형 필터"
          >
            <option value="">전체 유형</option>
            <option value="INQUIRY">문의</option>
            <option value="COMPLAINT">불만</option>
            <option value="SUGGESTION">제안</option>
            <option value="COMPLIMENT">칭찬</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-36"
            aria-label="상태 필터"
          >
            <option value="">전체 상태</option>
            <option value="PENDING">대기</option>
            <option value="IN_PROGRESS">처리 중</option>
            <option value="RESOLVED">해결</option>
            <option value="CLOSED">완료</option>
          </select>
        </div>

        {isLoading && (
          <div className="card p-16 text-center">
            <Loader2 className="h-8 w-8 text-brand-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">데이터를 불러오는 중...</p>
          </div>
        )}

        {!isLoading && (
          <div className="space-y-3">
            {vocList.map((voc) => {
              const config = typeConfig[voc.type];
              const Icon = config.icon;
              return (
                <Link
                  key={voc.id}
                  href={`/customer/voc/${voc.id}`}
                  className="card p-4 hover:shadow-md transition-shadow block"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "rounded-lg p-2 mt-0.5",
                        config.color.split(" ")[0],
                      )}
                    >
                      <Icon
                        className={cn("h-4 w-4", config.color.split(" ")[1])}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={cn("badge", config.color)}>
                          {config.label}
                        </span>
                        <span
                          className={cn("badge", priorityColors[voc.priority])}
                        >
                          {voc.priority === "URGENT"
                            ? "긴급"
                            : voc.priority === "HIGH"
                              ? "높음"
                              : voc.priority === "MEDIUM"
                                ? "보통"
                                : "낮음"}
                        </span>
                        <span
                          className={cn("badge", getStatusColor(voc.status))}
                        >
                          {statusLabels[voc.status]}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        {voc.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">
                        {voc.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                        <span>{voc.customerName}</span>
                        <span>{voc.category}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />{" "}
                          {formatDateTime(voc.createdAt)}
                        </span>
                        {voc.assignee && <span>담당: {voc.assignee}</span>}
                      </div>
                      {voc.response && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                          <p className="text-xs text-green-800">
                            <span className="font-semibold">답변:</span>{" "}
                            {voc.response}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
            {vocList.length === 0 && (
              <div className="card p-12 text-center text-gray-400 text-sm">
                해당 조건의 VOC가 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
