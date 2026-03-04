"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { useProduct, useDeleteProduct, useUpdateProduct } from "@/hooks";
import { formatCurrency, cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import {
  ArrowLeft,
  Star,
  Globe,
  Edit,
  Trash2,
  Package,
  Tag,
  BarChart3,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TAG_LABELS, TAG_COLORS } from "@/lib/constants";
import type { ProductTag } from "@/types/catalog";
import { ProductFormModal } from "@/components/forms";
import { useToast } from "@/components/ui/Toast";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const productId = typeof params.id === "string" ? params.id : "";

  const { data: product, isLoading, isError } = useProduct(productId);
  const deleteProduct = useDeleteProduct();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <>
        <Header title="상품 관리" description="카탈로그 플랫폼" />
        <div className="p-6">
          <div className="card p-16 text-center">
            <Loader2 className="h-8 w-8 text-brand-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">상품 정보를 불러오는 중...</p>
          </div>
        </div>
      </>
    );
  }

  if (isError || !product) {
    return (
      <>
        <Header title="상품 관리" description="카탈로그 플랫폼" />
        <div className="p-6">
          <div className="card p-16 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              상품을 찾을 수 없습니다
            </h2>
            <Link href="/catalog/products" className="btn-primary mt-4">
              상품 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </>
    );
  }

  const ratingDistribution = product.reviewSummary.distribution;

  return (
    <>
      <Header
        title="상품 상세"
        description={`카탈로그 플랫폼 · ${product.id}`}
      />
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Back + Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/catalog/products"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            상품 목록
          </Link>
          <div className="flex items-center gap-2">
            <button
              className="btn-secondary"
              onClick={() => setIsEditOpen(true)}
            >
              <Edit className="h-4 w-4 mr-1" />
              수정
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors text-sm"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              삭제
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image */}
          <div className="card overflow-hidden">
            <div className="aspect-square bg-gray-100 relative">
              {product.images[0]?.url ? (
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                  <Package className="h-16 w-16 mb-2" />
                  <span className="text-sm">이미지 없음</span>
                </div>
              )}
              {product.salesChannels.includes("GLOBAL") && (
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
                  <Globe className="h-5 w-5 text-indigo-600" />
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="card p-5 space-y-4">
              {/* Brand & Category */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="font-medium text-brand-primary">
                  {product.brand.name}
                </span>
                <span>·</span>
                <span>{product.category.name}</span>
              </div>

              {/* Name */}
              <h1 className="text-xl font-bold text-gray-900">
                {product.name}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className={cn("badge text-xs", TAG_COLORS[tag])}
                  >
                    {TAG_LABELS[tag]}
                  </span>
                ))}
              </div>

              {/* Price */}
              <div className="flex items-end gap-3">
                {product.discountRate > 0 && (
                  <>
                    <span className="text-2xl font-bold text-brand-accent">
                      {product.discountRate}%
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  </>
                )}
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(product.salePrice)}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-bold text-gray-900">
                  {product.reviewSummary.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({product.reviewSummary.totalCount.toLocaleString()}개 리뷰)
                </span>
              </div>

              {/* Sales Channels */}
              <div className="flex gap-2">
                {product.salesChannels.map((ch) => (
                  <span key={ch} className="badge bg-gray-100 text-gray-600">
                    {ch === "ONLINE"
                      ? "온라인"
                      : ch === "OFFLINE"
                        ? "오프라인"
                        : "글로벌"}
                  </span>
                ))}
              </div>

              {/* Volume & Skin Type */}
              {(product.volume || product.skinType) && (
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  {product.volume && (
                    <div className="flex text-sm">
                      <span className="text-gray-500 w-20">용량</span>
                      <span className="font-medium">{product.volume}</span>
                    </div>
                  )}
                  {product.skinType && product.skinType.length > 0 && (
                    <div className="flex text-sm">
                      <span className="text-gray-500 w-20">피부타입</span>
                      <span className="font-medium">
                        {product.skinType.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Review Distribution */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                리뷰 분포
              </h3>
              <div className="space-y-2">
                {([5, 4, 3, 2, 1] as const).map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-8">{star}점</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{
                          width: `${ratingDistribution[star]}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-10 text-right">
                      {ratingDistribution[star]}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Options (if exists) */}
            {product.options.length > 0 && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  옵션
                </h3>
                {product.options.map((opt) => (
                  <div key={opt.id}>
                    <p className="text-xs text-gray-500 mb-2">{opt.name}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {opt.values.map((val) => (
                        <div
                          key={val.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                        >
                          <span>{val.label}</span>
                          <span className="text-xs text-gray-500">
                            재고 {val.stock}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            상품 설명
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Delete Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="상품 삭제"
          description="이 작업은 되돌릴 수 없습니다."
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{product.name}</span> 상품을 정말
              삭제하시겠습니까?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary"
                disabled={isDeleting}
              >
                취소
              </button>
              <button
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await deleteProduct.mutateAsync(product.id);
                    toast("success", "상품이 삭제되었습니다.");
                    setShowDeleteModal(false);
                    router.push("/catalog/products");
                  } catch {
                    toast("error", "상품 삭제에 실패했습니다.");
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                disabled={isDeleting}
                className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    삭제 중...
                  </>
                ) : (
                  "삭제"
                )}
              </button>
            </div>
          </div>
        </Modal>

        {/* Edit Modal */}
        <ProductFormModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          product={product}
        />
      </div>
    </>
  );
}
