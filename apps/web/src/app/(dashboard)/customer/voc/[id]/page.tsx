"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { useVocItem } from "@/hooks";
import { cn, formatDateTime, getStatusColor } from "@/lib/utils";
import {
  ArrowLeft,
  MessageCircle,
  AlertTriangle,
  Lightbulb,
  Heart,
  Clock,
  User,
  Tag,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

const typeConfig: Record<
  string,
  { icon: typeof MessageCircle; label: string; color: string; bgColor: string }
> = {
  INQUIRY: {
    icon: MessageCircle,
    label: "문의",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  COMPLAINT: {
    icon: AlertTriangle,
    label: "불만",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  SUGGESTION: {
    icon: Lightbulb,
    label: "제안",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  COMPLIMENT: {
    icon: Heart,
    label: "칭찬",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  LOW: { label: "낮음", color: "bg-gray-100 text-gray-600" },
  MEDIUM: { label: "보통", color: "bg-blue-100 text-blue-700" },
  HIGH: { label: "높음", color: "bg-orange-100 text-orange-700" },
  URGENT: { label: "긴급", color: "bg-red-100 text-red-700" },
};

const statusConfig: Record<string, { label: string; icon: typeof Clock }> = {
  PENDING: { label: "대기", icon: Clock },
  IN_PROGRESS: { label: "처리 중", icon: AlertCircle },
  RESOLVED: { label: "해결", icon: CheckCircle2 },
  CLOSED: { label: "완료", icon: CheckCircle2 },
};

export default function VocDetailPage() {
  const params = useParams();
  const vocId = typeof params.id === "string" ? params.id : "";
  const { data: voc, isLoading, isError } = useVocItem(vocId);

  if (isLoading) {
    return (
      <>
        <Header title="고객의 소리 (VOC)" description="커스터머 플랫폼" />
        <div className="p-6">
          <div className="card p-16 text-center">
            <Loader2 className="h-8 w-8 text-brand-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">VOC 정보를 불러오는 중...</p>
          </div>
        </div>
      </>
    );
  }

  if (isError || !voc) {
    return (
      <>
        <Header title="고객의 소리 (VOC)" description="커스터머 플랫폼" />
        <div className="p-6">
          <div className="card p-16 text-center">
            <p className="text-sm text-gray-500 mb-4">
              VOC를 찾을 수 없습니다.
            </p>
            <Link
              href="/customer/voc"
              className="text-sm text-brand-primary hover:underline"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </>
    );
  }

  const type = typeConfig[voc.type] ?? typeConfig.INQUIRY;
  const TypeIcon = type.icon;
  const priority = priorityConfig[voc.priority] ?? priorityConfig.MEDIUM;
  const statusInfo = statusConfig[voc.status] ?? statusConfig.PENDING;
  const StatusIcon = statusInfo.icon;

  return (
    <>
      <Header title="VOC 상세" description="커스터머 플랫폼" />
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Back */}
        <Link
          href="/customer/voc"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          VOC 목록
        </Link>

        {/* Title Card */}
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className={cn("rounded-xl p-3", type.bgColor)}>
              <TypeIcon className={cn("h-6 w-6", type.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={cn("badge", type.bgColor, type.color)}>
                  {type.label}
                </span>
                <span className={cn("badge", priority.color)}>
                  {priority.label}
                </span>
                <span className={cn("badge", getStatusColor(voc.status))}>
                  <StatusIcon className="h-3 w-3 mr-1 inline" />
                  {statusInfo.label}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {voc.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(voc.createdAt)}
                </span>
                <span>ID: {voc.id}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - left 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 고객 문의 내용 */}
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-gray-400" />
                문의 내용
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {voc.content}
                </p>
              </div>
            </div>

            {/* 답변 */}
            {voc.response ? (
              <div className="card p-6 border-l-4 border-green-400">
                <h3 className="text-sm font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  답변 완료
                </h3>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-800 leading-relaxed whitespace-pre-wrap">
                    {voc.response}
                  </p>
                </div>
                {voc.resolvedAt && (
                  <p className="text-xs text-gray-400 mt-3">
                    답변일: {formatDateTime(voc.resolvedAt)}
                  </p>
                )}
              </div>
            ) : (
              <div className="card p-6 border-l-4 border-yellow-400">
                <h3 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  답변 대기 중
                </h3>
                <p className="text-sm text-gray-500">
                  아직 답변이 등록되지 않았습니다.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - right 1/3 */}
          <div className="space-y-6">
            {/* 고객 정보 */}
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                고객 정보
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">이름</span>
                  <Link
                    href={`/customer/members/${voc.customerId}`}
                    className="font-medium text-brand-primary hover:underline"
                  >
                    {voc.customerName}
                  </Link>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">고객 ID</span>
                  <span className="font-mono text-xs text-gray-600">
                    {voc.customerId}
                  </span>
                </div>
              </div>
            </div>

            {/* 처리 정보 */}
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-400" />
                처리 정보
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">카테고리</span>
                  <span className="font-medium text-gray-900">
                    {voc.category}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">담당자</span>
                  <span className="font-medium text-gray-900">
                    {voc.assignee || "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">접수일</span>
                  <span className="text-gray-600 text-xs">
                    {formatDateTime(voc.createdAt)}
                  </span>
                </div>
                {voc.resolvedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">해결일</span>
                    <span className="text-gray-600 text-xs">
                      {formatDateTime(voc.resolvedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 처리 타임라인 */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                처리 타임라인
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: "접수",
                    time: voc.createdAt,
                    done: true,
                  },
                  {
                    label: "처리 중",
                    time: voc.status !== "PENDING" ? voc.createdAt : null,
                    done: voc.status !== "PENDING",
                  },
                  {
                    label: "해결",
                    time: voc.resolvedAt,
                    done: voc.status === "RESOLVED" || voc.status === "CLOSED",
                  },
                  {
                    label: "완료",
                    time: voc.status === "CLOSED" ? voc.resolvedAt : null,
                    done: voc.status === "CLOSED",
                  },
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "h-3 w-3 rounded-full border-2",
                          step.done
                            ? "bg-green-500 border-green-500"
                            : "bg-white border-gray-300",
                        )}
                      />
                      {idx < 3 && (
                        <div
                          className={cn(
                            "w-0.5 h-6 mt-1",
                            step.done ? "bg-green-300" : "bg-gray-200",
                          )}
                        />
                      )}
                    </div>
                    <div className="-mt-0.5">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          step.done ? "text-gray-900" : "text-gray-400",
                        )}
                      >
                        {step.label}
                      </p>
                      {step.time && step.done && (
                        <p className="text-xs text-gray-400">
                          {formatDateTime(step.time)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
