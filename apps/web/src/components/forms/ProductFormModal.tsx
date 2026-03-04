"use client";

import { useState } from "react";
import { Modal } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { useCreateProduct, useCategories, useBrands } from "@/hooks";
import { Loader2 } from "lucide-react";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TAG_OPTIONS = [
  { value: "BEST", label: "BEST" },
  { value: "NEW", label: "NEW" },
  { value: "SALE", label: "SALE" },
  { value: "TODAY_DEAL", label: "오늘의 특가" },
  { value: "ONLINE_ONLY", label: "온라인 전용" },
  { value: "EDITOR_PICK", label: "에디터 PICK" },
  { value: "GLOBAL", label: "GLOBAL" },
] as const;

const CHANNEL_OPTIONS = [
  { value: "ONLINE", label: "온라인" },
  { value: "OFFLINE", label: "오프라인" },
  { value: "GLOBAL", label: "글로벌" },
] as const;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "판매 중" },
  { value: "INACTIVE", label: "판매 중지" },
  { value: "OUT_OF_STOCK", label: "품절" },
  { value: "DISCONTINUED", label: "단종" },
] as const;

export function ProductFormModal({ isOpen, onClose }: ProductFormModalProps) {
  const { data: categoriesData } = useCategories();
  const { data: brandsData } = useBrands();
  const createProduct = useCreateProduct();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    brandId: "",
    categoryId: "",
    originalPrice: 0,
    salePrice: 0,
    description: "",
    shortDescription: "",
    volume: "",
    skinType: [] as string[],
    tags: [] as string[],
    salesChannels: [] as string[],
    status: "ACTIVE" as string,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = categoriesData ?? [];
  const brands = brandsData ?? [];

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "originalPrice" || name === "salePrice"
          ? Number(value)
          : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleMultiSelect(field: string, value: string) {
    setForm((prev) => {
      const arr = prev[field as keyof typeof prev] as string[];
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (form.name.length < 2) newErrors.name = "상품명은 2자 이상이어야 합니다";
    if (!form.brandId) newErrors.brandId = "브랜드를 선택해주세요";
    if (!form.categoryId) newErrors.categoryId = "카테고리를 선택해주세요";
    if (form.originalPrice < 100)
      newErrors.originalPrice = "가격은 100원 이상이어야 합니다";
    if (form.salePrice > form.originalPrice)
      newErrors.salePrice = "할인가는 정가보다 낮아야 합니다";
    if (form.description.length < 10)
      newErrors.description = "상품 설명은 10자 이상이어야 합니다";
    if (form.salesChannels.length === 0)
      newErrors.salesChannels = "판매 채널을 1개 이상 선택해주세요";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createProduct.mutateAsync({
        name: form.name,
        brandId: form.brandId,
        categoryId: form.categoryId,
        originalPrice: form.originalPrice,
        salePrice: form.salePrice,
        description: form.description,
        shortDescription: form.shortDescription,
        volume: form.volume || undefined,
        skinType: form.skinType.length > 0 ? form.skinType : undefined,
        tags: form.tags as (
          | "BEST"
          | "NEW"
          | "SALE"
          | "TODAY_DEAL"
          | "ONLINE_ONLY"
          | "EDITOR_PICK"
          | "GLOBAL"
        )[],
        salesChannels: form.salesChannels as (
          | "ONLINE"
          | "OFFLINE"
          | "GLOBAL"
        )[],
        status: form.status as
          | "ACTIVE"
          | "INACTIVE"
          | "OUT_OF_STOCK"
          | "DISCONTINUED",
      });
      toast("success", "상품이 등록되었습니다.");
      onClose();
      // 폼 초기화
      setForm({
        name: "",
        brandId: "",
        categoryId: "",
        originalPrice: 0,
        salePrice: 0,
        description: "",
        shortDescription: "",
        volume: "",
        skinType: [],
        tags: [],
        salesChannels: [],
        status: "ACTIVE",
      });
    } catch {
      toast("error", "상품 등록에 실패했습니다.");
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="상품 등록"
      description="새 상품을 카탈로그에 등록합니다."
      size="lg"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[65vh] overflow-y-auto pr-1"
      >
        {/* 상품명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            상품명 <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="input-field w-full"
            placeholder="상품명을 입력하세요"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* 브랜드 / 카테고리 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              브랜드 <span className="text-red-500">*</span>
            </label>
            <select
              name="brandId"
              value={form.brandId}
              onChange={handleChange}
              className="input-field w-full"
            >
              <option value="">선택</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            {errors.brandId && (
              <p className="text-xs text-red-500 mt-1">{errors.brandId}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="input-field w-full"
            >
              <option value="">선택</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>
            )}
          </div>
        </div>

        {/* 가격 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              정가 (원) <span className="text-red-500">*</span>
            </label>
            <input
              name="originalPrice"
              type="number"
              value={form.originalPrice || ""}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="0"
            />
            {errors.originalPrice && (
              <p className="text-xs text-red-500 mt-1">
                {errors.originalPrice}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              할인가 (원)
            </label>
            <input
              name="salePrice"
              type="number"
              value={form.salePrice || ""}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="0"
            />
            {errors.salePrice && (
              <p className="text-xs text-red-500 mt-1">{errors.salePrice}</p>
            )}
          </div>
        </div>

        {/* 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            상품 설명 <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="input-field w-full h-20 resize-none"
            placeholder="상품 설명을 입력하세요 (10자 이상)"
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            간단 설명
          </label>
          <input
            name="shortDescription"
            value={form.shortDescription}
            onChange={handleChange}
            className="input-field w-full"
            placeholder="간단 설명 (200자 이하)"
          />
        </div>

        {/* 상태 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            상태
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="input-field w-full"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 태그 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            태그
          </label>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map((tag) => (
              <button
                key={tag.value}
                type="button"
                onClick={() => handleMultiSelect("tags", tag.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  form.tags.includes(tag.value)
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* 판매 채널 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            판매 채널 <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CHANNEL_OPTIONS.map((ch) => (
              <button
                key={ch.value}
                type="button"
                onClick={() => handleMultiSelect("salesChannels", ch.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  form.salesChannels.includes(ch.value)
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
          {errors.salesChannels && (
            <p className="text-xs text-red-500 mt-1">{errors.salesChannels}</p>
          )}
        </div>

        {/* 액션 */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button type="button" onClick={onClose} className="btn-secondary">
            취소
          </button>
          <button
            type="submit"
            disabled={createProduct.isPending}
            className="btn-primary disabled:opacity-50"
          >
            {createProduct.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> 등록 중...
              </>
            ) : (
              "상품 등록"
            )}
          </button>
        </div>

        {createProduct.isError && (
          <p className="text-xs text-red-500 text-center">
            등록에 실패했습니다. 입력값을 확인해주세요.
          </p>
        )}
      </form>
    </Modal>
  );
}
