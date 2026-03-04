import { create } from "zustand";
import { products as initialProducts } from "@/data/catalog";
import { Product, ProductFilter, PaginatedResponse } from "@/types/catalog";

interface CatalogState {
  products: Product[];
  filter: ProductFilter;
  currentPage: number;
  pageSize: number;

  // Actions
  setFilter: (filter: Partial<ProductFilter>) => void;
  resetFilter: () => void;
  setPage: (page: number) => void;
  getFilteredProducts: () => PaginatedResponse<Product>;
  getProductById: (id: string) => Product | undefined;
}

const defaultFilter: ProductFilter = {
  sortBy: "latest",
};

export const useCatalogStore = create<CatalogState>((set, get) => ({
  products: initialProducts,
  filter: defaultFilter,
  currentPage: 1,
  pageSize: 12,

  setFilter: (filter) =>
    set((state) => ({
      filter: { ...state.filter, ...filter },
      currentPage: 1,
    })),

  resetFilter: () => set({ filter: defaultFilter, currentPage: 1 }),

  setPage: (page) => set({ currentPage: page }),

  getFilteredProducts: () => {
    const { products, filter, currentPage, pageSize } = get();
    let filtered = [...products];

    // 검색어 필터
    if (filter.search) {
      const search = filter.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.brand.name.toLowerCase().includes(search) ||
          p.category.name.toLowerCase().includes(search),
      );
    }

    // 카테고리 필터
    if (filter.categoryId) {
      filtered = filtered.filter((p) => p.category.id === filter.categoryId);
    }

    // 브랜드 필터
    if (filter.brandId) {
      filtered = filtered.filter((p) => p.brand.id === filter.brandId);
    }

    // 가격 필터
    if (filter.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.salePrice >= filter.minPrice!);
    }
    if (filter.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.salePrice <= filter.maxPrice!);
    }

    // 태그 필터
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter((p) =>
        filter.tags!.some((tag) => p.tags.includes(tag)),
      );
    }

    // 채널 필터
    if (filter.channels && filter.channels.length > 0) {
      filtered = filtered.filter((p) =>
        filter.channels!.some((ch) => p.salesChannels.includes(ch)),
      );
    }

    // 정렬
    switch (filter.sortBy) {
      case "price_asc":
        filtered.sort((a, b) => a.salePrice - b.salePrice);
        break;
      case "price_desc":
        filtered.sort((a, b) => b.salePrice - a.salePrice);
        break;
      case "rating":
        filtered.sort(
          (a, b) =>
            b.reviewSummary.averageRating - a.reviewSummary.averageRating,
        );
        break;
      case "reviews":
        filtered.sort(
          (a, b) => b.reviewSummary.totalCount - a.reviewSummary.totalCount,
        );
        break;
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const start = (currentPage - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return {
      items,
      pagination: { page: currentPage, size: pageSize, totalItems, totalPages },
    };
  },

  getProductById: (id) => {
    return get().products.find((p) => p.id === id);
  },
}));
