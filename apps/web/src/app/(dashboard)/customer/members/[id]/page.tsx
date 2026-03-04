"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { useMember } from "@/hooks";
import {
  cn,
  getMemberGradeLabel,
  formatCurrency,
  formatDateTime,
  getStatusColor,
} from "@/lib/utils";
import { GRADE_COLORS } from "@/lib/constants";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  ShoppingBag,
  Star,
  Loader2,
  MapPin,
  Smartphone,
} from "lucide-react";

export default function MemberDetailPage() {
  const params = useParams();
  const memberId = typeof params.id === "string" ? params.id : "";
  const { data: member, isLoading, isError } = useMember(memberId);

  if (isLoading) {
    return (
      <>
        <Header title="회원 관리" description="커스터머 플랫폼" />
        <div className="p-6">
          <div className="card p-16 text-center">
            <Loader2 className="h-8 w-8 text-brand-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">회원 정보를 불러오는 중...</p>
          </div>
        </div>
      </>
    );
  }

  if (isError || !member) {
    return (
      <>
        <Header title="회원 관리" description="커스터머 플랫폼" />
        <div className="p-6">
          <div className="card p-16 text-center">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              회원을 찾을 수 없습니다
            </h2>
            <Link href="/customer/members" className="btn-primary mt-4">
              회원 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="회원 상세"
        description={`커스터머 플랫폼 · ${member.id}`}
      />
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Back */}
        <Link
          href="/customer/members"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          회원 목록
        </Link>

        {/* Profile Card */}
        <div className="card p-6">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-brand-primary">
                {member.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">
                  {member.name}
                </h1>
                <span
                  className={cn("badge text-sm", GRADE_COLORS[member.grade])}
                >
                  {getMemberGradeLabel(member.grade)}
                </span>
                <span className={cn("badge", getStatusColor(member.status))}>
                  {member.status === "ACTIVE"
                    ? "활성"
                    : member.status === "DORMANT"
                      ? "휴면"
                      : "탈퇴"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {member.email}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {member.phone}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  가입일: {formatDateTime(member.joinedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                총 구매액
              </span>
              <div className="rounded-lg p-2 bg-blue-100">
                <CreditCard className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(member.totalPurchaseAmount)}
            </span>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                총 주문수
              </span>
              <div className="rounded-lg p-2 bg-green-100">
                <ShoppingBag className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <span className="text-xl font-bold text-gray-900">
              {member.totalOrders}건
            </span>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                보유 포인트
              </span>
              <div className="rounded-lg p-2 bg-yellow-100">
                <Star className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <span className="text-xl font-bold text-brand-primary">
              {member.points.toLocaleString()}P
            </span>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                가입 채널
              </span>
              <div className="rounded-lg p-2 bg-purple-100">
                <Smartphone className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <span className="text-xl font-bold text-gray-900">
              {member.joinChannel}
            </span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              회원 정보
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">회원 ID</span>
                <span className="font-mono text-xs">{member.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">가입일</span>
                <span>{formatDateTime(member.joinedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">최근 로그인</span>
                <span>{formatDateTime(member.lastLoginAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">생년월일</span>
                <span>{member.birthDate || "-"}</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              배송 주소
            </h3>
            {member.address ? (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">기본 주소</span>
                    {member.address.isDefault && (
                      <span className="badge bg-brand-primary/10 text-brand-primary text-[10px]">
                        기본
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">
                    {member.address.address1} {member.address.address2}
                  </p>
                  <p className="text-xs text-gray-400">
                    {member.address.city} · {member.address.zipCode}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">등록된 주소가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
