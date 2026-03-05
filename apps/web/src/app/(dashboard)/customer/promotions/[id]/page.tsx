"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { usePromotion } from "@/hooks";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Percent,
  Gift,
  Zap,
  Truck,
  Tag,
  Users,
  Calendar,
  Target,
  TrendingUp,
  Loader2,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
} from "lucide-react";

const promoTypeConfig: Record<
  string,
  { icon: typeof Tag; label: string; color: string; bgColor: string }
> = {
  DISCOUNT: {
    icon: Percent,
    label: "할인",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  BUNDLE: {
    icon: Gift,
    label: "번들",
    color: "text-pink-600",
    bgColor: "bg-pink-100",
  },
  GIFT: {
    icon: Gift,
    label: "사은품",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  POINTS_MULTIPLIER: {
    icon: Zap,
    label: "포인트 배율",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  FREE_SHIPPING: {
    icon: Truck,
    label: "무료배송",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
};

export default function PromotionDetailPage() {
  const params = useParams();
  const promoId = typeof params.id === "string" ? params.id : "";
  const { data: promo, isLoading, isError } = usePromotion(promoId);

  if (isLoading) {
    return (
      <>
        <Header title="프로모션 관리" description="커스터머 플랫폼" />
        <div className="p-6">
          <div className="card p-16 text-center">
            <Loader2 className="h-8 w-8 text-brand-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">
              프로모션 정보를 불러오는 중...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (isError || !promo) {
    return (
      <>
        <Header title="프로모션 관리" description="커스터머 플랫폼" />
        <div className="p-6">
          <div className="card p-16 text-center">
            <p className="text-sm text-gray-500 mb-4">
              프로모션을 찾을 수 없습니다.
            </p>
            <Link
              href="/customer/promotions"
              className="text-sm text-brand-primary hover:underline"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </>
    );
  }

  const config = promoTypeConfig[promo.type] ?? {
    icon: Tag,
    label: promo.type,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  };
  const Icon = config.icon;

  const progress = promo.maxParticipants
    ? (promo.participantCount / promo.maxParticipants) * 100
    : null;

  const now = new Date();
  const startDate = new Date(promo.startDate);
  const endDate = new Date(promo.endDate);
  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const elapsedDays = Math.ceil(
    (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const daysRemaining = Math.max(
    0,
    Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const timeProgress =
    totalDays > 0 ? Math.min(100, (elapsedDays / totalDays) * 100) : 0;

  return (
    <>
      <Header title="프로모션 상세" description="커스터머 플랫폼" />
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Back */}
        <Link
          href="/customer/promotions"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          프로모션 목록
        </Link>

        {/* Banner */}
        {promo.bannerImageUrl ? (
          <div className="card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={promo.bannerImageUrl}
              alt={promo.name}
              className="w-full h-48 sm:h-64 object-cover"
            />
          </div>
        ) : (
          <div className="card h-48 sm:h-64 bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 flex items-center justify-center">
            <ImageIcon className="h-16 w-16 text-brand-primary/30" />
          </div>
        )}

        {/* Title & Status */}
        <div className="card p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              <div className={cn("rounded-xl p-3", config.bgColor)}>
                <Icon className={cn("h-6 w-6", config.color)} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {promo.name}
                  </h2>
                  <span
                    className={cn(
                      "badge text-sm",
                      promo.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500",
                    )}
                  >
                    {promo.isActive ? "진행 중" : "예정/종료"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{promo.description}</p>
              </div>
            </div>
            <span className={cn("badge text-sm", config.bgColor, config.color)}>
              {config.label}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-brand-primary" />
              <span className="text-xs text-gray-500">할인/혜택 값</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {promo.type === "DISCOUNT"
                ? `${promo.value}%`
                : promo.type === "POINTS_MULTIPLIER"
                  ? `${promo.value}배`
                  : promo.type === "FREE_SHIPPING"
                    ? "무료"
                    : `${promo.value}%`}
            </p>
          </div>
          <div className="card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-gray-500">참여자 수</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {promo.participantCount.toLocaleString()}
            </p>
          </div>
          <div className="card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-gray-500">최대 참여</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {promo.maxParticipants
                ? promo.maxParticipants.toLocaleString()
                : "무제한"}
            </p>
          </div>
          <div className="card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-gray-500">남은 일수</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {promo.isActive ? `D-${daysRemaining}` : "-"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Period & Progress */}
          <div className="card p-6 space-y-5">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              기간 및 진행률
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">시작일</span>
                <span className="font-medium text-gray-900">
                  {formatDate(promo.startDate)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">종료일</span>
                <span className="font-medium text-gray-900">
                  {formatDate(promo.endDate)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">총 기간</span>
                <span className="font-medium text-gray-900">{totalDays}일</span>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>기간 진행률</span>
                  <span>{Math.min(100, timeProgress).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-primary rounded-full transition-all"
                    style={{ width: `${Math.min(100, timeProgress)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Participant Progress */}
            {progress !== null && (
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>참여 현황</span>
                  <span>
                    {promo.participantCount.toLocaleString()} /{" "}
                    {promo.maxParticipants!.toLocaleString()} (
                    {progress.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      progress >= 90
                        ? "bg-red-500"
                        : progress >= 70
                          ? "bg-orange-500"
                          : "bg-green-500",
                    )}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Target Info */}
          <div className="card p-6 space-y-5">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-400" />
              타겟 정보
            </h3>

            <div className="space-y-4">
              {promo.targetCategories && promo.targetCategories.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">대상 카테고리</p>
                  <div className="flex flex-wrap gap-2">
                    {promo.targetCategories.map((cat) => (
                      <span
                        key={cat}
                        className="badge bg-blue-50 text-blue-700"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {promo.targetGrades && promo.targetGrades.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">대상 회원 등급</p>
                  <div className="flex flex-wrap gap-2">
                    {promo.targetGrades.map((grade) => (
                      <span
                        key={grade}
                        className="badge bg-purple-50 text-purple-700"
                      >
                        {grade}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {promo.targetProducts && promo.targetProducts.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">대상 상품</p>
                  <div className="flex flex-wrap gap-2">
                    {promo.targetProducts.map((pid) => (
                      <span
                        key={pid}
                        className="badge bg-gray-100 text-gray-600"
                      >
                        {pid}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!promo.targetCategories?.length &&
                !promo.targetGrades?.length &&
                !promo.targetProducts?.length && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    전체 대상 (제한 없음)
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
