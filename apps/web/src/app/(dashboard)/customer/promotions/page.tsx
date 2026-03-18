"use client";

import Header from "@/components/layout/Header";
import { usePromotions, useCoupons } from "@/hooks";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Tag, Percent, Gift, Zap, Truck, Users, Loader2 } from "lucide-react";
import Link from "next/link";

const promoTypeIcons: Record<string, typeof Tag> = {
  DISCOUNT: Percent,
  BUNDLE: Gift,
  GIFT: Gift,
  POINTS_MULTIPLIER: Zap,
  FREE_SHIPPING: Truck,
};

const promoTypeLabels: Record<string, string> = {
  DISCOUNT: "할인",
  BUNDLE: "번들",
  GIFT: "사은품",
  POINTS_MULTIPLIER: "포인트 배율",
  FREE_SHIPPING: "무료배송",
};

export default function PromotionsPage() {
  const { data: promotions, isLoading: promoLoading } = usePromotions();
  const { data: coupons, isLoading: couponLoading } = useCoupons();

  const isLoading = promoLoading || couponLoading;

  return (
    <>
      <Header
        title="프로모션 관리"
        description="커스터머 플랫폼 · 프로모션 서비스 고도화"
      />
      <div className="p-6 space-y-6 animate-fade-in">
        {isLoading && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            role="status"
            aria-label="프로모션 로딩 중"
          >
            <span className="sr-only">
              프로모션 데이터를 불러오는 중입니다...
            </span>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-800 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-800/60 rounded" />
                  </div>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800/60 rounded-full" />
                <div className="flex justify-between">
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-5 w-14 bg-gray-200 dark:bg-gray-800 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && promotions && (
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              진행 중인 프로모션
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {promotions
                .filter((p) => p.isActive)
                .map((promo) => {
                  const Icon = promoTypeIcons[promo.type] ?? Tag;
                  const progress = promo.maxParticipants
                    ? (promo.participantCount / promo.maxParticipants) * 100
                    : null;
                  return (
                    <Link
                      key={promo.id}
                      href={`/customer/promotions/${promo.id}`}
                      className="card overflow-hidden hover:shadow-md transition-shadow block"
                    >
                      {promo.bannerImageUrl && (
                        <div className="h-32 bg-gray-100 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={promo.bannerImageUrl}
                            alt={promo.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="rounded-lg bg-brand-primary/10 p-1.5">
                            <Icon className="h-4 w-4 text-brand-primary" />
                          </div>
                          <span className="badge bg-green-100 text-green-700">
                            진행 중
                          </span>
                          <span className="badge bg-gray-100 text-gray-600">
                            {promoTypeLabels[promo.type]}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">
                          {promo.name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">
                          {promo.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            {formatDate(promo.startDate)} ~{" "}
                            {formatDate(promo.endDate)}
                          </span>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>
                              {promo.participantCount.toLocaleString()}명
                            </span>
                          </div>
                        </div>
                        {progress !== null && (
                          <div className="mt-3">
                            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                              <span>참여 현황</span>
                              <span>{progress.toFixed(1)}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-primary rounded-full transition-all"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
            </div>
          </section>
        )}

        {!isLoading && coupons && (
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              쿠폰 관리
            </h2>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="table-header">쿠폰명</th>
                      <th className="table-header">코드</th>
                      <th className="table-header">유형</th>
                      <th className="table-header">할인</th>
                      <th className="table-header">최소 구매액</th>
                      <th className="table-header">기간</th>
                      <th className="table-header">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon) => (
                      <tr
                        key={coupon.id}
                        className="border-b border-gray-50 hover:bg-gray-50/80"
                      >
                        <td className="table-cell font-medium text-gray-900">
                          {coupon.name}
                        </td>
                        <td className="table-cell font-mono text-xs text-brand-primary">
                          {coupon.code}
                        </td>
                        <td className="table-cell">
                          <span className="badge bg-gray-100 text-gray-600">
                            {coupon.type === "PERCENTAGE"
                              ? "퍼센트"
                              : coupon.type === "FIXED_AMOUNT"
                                ? "정액"
                                : "무료배송"}
                          </span>
                        </td>
                        <td className="table-cell font-medium">
                          {coupon.type === "PERCENTAGE"
                            ? `${coupon.value}%`
                            : coupon.type === "FIXED_AMOUNT"
                              ? formatCurrency(coupon.value)
                              : "-"}
                        </td>
                        <td className="table-cell text-sm">
                          {formatCurrency(coupon.minPurchaseAmount)}
                        </td>
                        <td className="table-cell text-xs text-gray-500">
                          {formatDate(coupon.startDate)} ~{" "}
                          {formatDate(coupon.endDate)}
                        </td>
                        <td className="table-cell">
                          <span
                            className={cn(
                              "badge",
                              coupon.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : coupon.status === "USED"
                                  ? "bg-gray-100 text-gray-600"
                                  : "bg-red-100 text-red-700",
                            )}
                          >
                            {coupon.status === "ACTIVE"
                              ? "사용 가능"
                              : coupon.status === "USED"
                                ? "사용 완료"
                                : "만료"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
