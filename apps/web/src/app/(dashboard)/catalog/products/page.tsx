"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import {
  useProducts,
  useCategories,
  useBrands,
  useDeleteProduct,
} from "@/hooks";
import { useDebounce } from "@/hooks";
import { useRouter } from "next/navigation";
import { formatCurrency, cn, getStatusColor } from "@/lib/utils";
import { Search, Plus, Star, Globe, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TAG_LABELS, TAG_COLORS } from "@/lib/constants";
import type { ProductTag } from "@/types/catalog";
import { Pagination } from "@/components/ui";
import { ProductFormModal, ConfirmDeleteModal } from "@/components/forms";
import { useToast } from "@/components/ui/Toast";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const deleteProduct = useDeleteProduct();
  const router = useRouter();
  const { toast } = useToast();

  const { data: categoriesData } = useCategories();
  const { data: brandsData } = useBrands();
  const {
    data: productsData,
    isLoading,
    isError,
    error,
  } = useProducts({
    page,
    size: 12,
    search: debouncedSearch || undefined,
    categoryId: selectedCategory || undefined,
    brandId: selectedBrand || undefined,
    sortBy: "latest",
  });

  const categories = categoriesData ?? [];
  const brands = brandsData ?? [];
  const filtered = productsData?.items ?? [];
  const pagination = productsData?.pagination;

  return (
    <>
      <Header
        title="상품 관리"
        description="카탈로그 플랫폼 · 상품 데이터 허브"
      />
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="상품명, 브랜드 검색..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="input-field pl-9"
                aria-label="상품 검색"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="input-field w-40"
              aria-label="카테고리 필터"
            >
              <option value="">전체 카테고리</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setPage(1);
              }}
              className="input-field w-40"
              aria-label="브랜드 필터"
            >
              <option value="">전체 브랜드</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <div
              className="flex gap-1 border border-gray-200 rounded-lg p-0.5"
              role="tablist"
            >
              <button
                role="tab"
                aria-selected={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  viewMode === "grid"
                    ? "bg-brand-primary text-white"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                그리드
              </button>
              <button
                role="tab"
                aria-selected={viewMode === "table"}
                onClick={() => setViewMode("table")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  viewMode === "table"
                    ? "bg-brand-primary text-white"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                테이블
              </button>
            </div>
            <button className="btn-primary" onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> 상품 등록
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            총 {pagination?.totalItems ?? 0}개의 상품
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="card p-16 text-center">
            <Loader2 className="h-8 w-8 text-brand-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">상품을 불러오는 중...</p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="card p-16 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-red-300" />
            </div>
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

        {/* Empty State */}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="card p-16 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              검색 결과가 없습니다
            </h3>
            <p className="text-xs text-gray-500">
              다른 검색어나 필터를 시도해보세요.
            </p>
          </div>
        )}

        {/* Grid View */}
        {!isLoading &&
          !isError &&
          filtered.length > 0 &&
          viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((product) => (
                <Link key={product.id} href={`/catalog/products/${product.id}`}>
                  <article
                    className="card overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
                    aria-label={`${product.brand.name} ${product.name}`}
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      <Image
                        src={product.images[0]?.url}
                        alt={product.name}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        {product.tags.map((tag) => (
                          <span
                            key={tag}
                            className={cn(
                              "badge text-[10px]",
                              TAG_COLORS[tag as ProductTag],
                            )}
                          >
                            {TAG_LABELS[tag as ProductTag]}
                          </span>
                        ))}
                      </div>
                      {product.discountRate > 0 && (
                        <div className="absolute top-2 right-2 bg-brand-accent text-white text-xs font-bold px-2 py-1 rounded-lg">
                          {product.discountRate}%
                        </div>
                      )}
                      {product.salesChannels.includes("GLOBAL") && (
                        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5">
                          <Globe className="h-3.5 w-3.5 text-indigo-600" />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="p-3.5">
                      <p className="text-[10px] font-medium text-gray-400 mb-0.5">
                        {product.brand.name}
                      </p>
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium text-gray-700">
                          {product.reviewSummary.averageRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({product.reviewSummary.totalCount.toLocaleString()})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {product.discountRate > 0 && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatCurrency(product.originalPrice)}
                          </span>
                        )}
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(product.salePrice)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget({
                              id: product.id,
                              name: product.name,
                            });
                          }}
                          className="ml-auto p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="상품 삭제"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}

        {/* Table View */}
        {!isLoading &&
          !isError &&
          filtered.length > 0 &&
          viewMode === "table" && (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="table-header">상품</th>
                    <th className="table-header">브랜드</th>
                    <th className="table-header">카테고리</th>
                    <th className="table-header">가격</th>
                    <th className="table-header">할인</th>
                    <th className="table-header">평점</th>
                    <th className="table-header">상태</th>
                    <th className="table-header">채널</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-gray-50 hover:bg-gray-50/80 cursor-pointer"
                      onClick={() =>
                        router.push(`/catalog/products/${product.id}`)
                      }
                    >
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <Image
                            src={product.images[0]?.url}
                            alt=""
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-lg object-cover"
                            loading="lazy"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {product.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell text-sm">
                        {product.brand.name}
                      </td>
                      <td className="table-cell text-sm">
                        {product.category.name}
                      </td>
                      <td className="table-cell font-medium">
                        {formatCurrency(product.salePrice)}
                      </td>
                      <td className="table-cell">
                        {product.discountRate > 0 && (
                          <span className="text-xs font-semibold text-brand-accent">
                            {product.discountRate}%
                          </span>
                        )}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">
                            {product.reviewSummary.averageRating.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span
                          className={cn(
                            "badge",
                            getStatusColor(product.status),
                          )}
                        >
                          {product.status === "ACTIVE"
                            ? "판매 중"
                            : "판매 중지"}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-1">
                          {product.salesChannels.map((ch) => (
                            <span
                              key={ch}
                              className="badge bg-gray-100 text-gray-600 text-[10px]"
                            >
                              {ch}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
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
              await deleteProduct.mutateAsync(deleteTarget.id);
              toast("success", "상품이 삭제되었습니다.");
              setDeleteTarget(null);
            } catch {
              toast("error", "상품 삭제에 실패했습니다.");
            }
          }
        }}
        title="상품 삭제"
        description={`"${deleteTarget?.name}" 상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        isPending={deleteProduct.isPending}
      />
    </>
  );
}
