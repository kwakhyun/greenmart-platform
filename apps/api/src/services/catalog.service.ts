import type { Product, PaginatedResponse } from "@greenmart/shared";
import { CatalogRepository } from "../repositories/catalog.repository";
import { NotFoundError, BadRequestError } from "../errors";

export interface ProductListParams {
  page: number;
  size: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  tags?: string;
  channels?: string;
  status?: Product["status"];
  sortBy: "latest" | "price_asc" | "price_desc" | "rating" | "reviews";
}

export interface CreateProductParams {
  name: string;
  brandId: string;
  categoryId: string;
  originalPrice: number;
  salePrice: number;
  description: string;
  shortDescription: string;
  tags: Product["tags"];
  salesChannels: Product["salesChannels"];
  status: Product["status"];
  volume?: string;
  skinType?: string[];
}

/**
 * Catalog Service — 비즈니스 로직 계층
 */
export class CatalogService {
  constructor(private readonly repo: CatalogRepository) {}

  getProducts(params: ProductListParams): PaginatedResponse<Product> {
    let filtered = this.repo.findAllProducts();

    // 검색어 필터
    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.brand.name.toLowerCase().includes(s) ||
          p.category.name.toLowerCase().includes(s),
      );
    }

    // 카테고리 필터
    if (params.categoryId) {
      filtered = filtered.filter((p) => p.category.id === params.categoryId);
    }

    // 브랜드 필터
    if (params.brandId) {
      filtered = filtered.filter((p) => p.brand.id === params.brandId);
    }

    // 태그 필터
    if (params.tags) {
      const tagArr = params.tags.split(",");
      filtered = filtered.filter((p) =>
        tagArr.some((t) => p.tags.includes(t as Product["tags"][number])),
      );
    }

    // 채널 필터
    if (params.channels) {
      const chArr = params.channels.split(",");
      filtered = filtered.filter((p) =>
        chArr.some((c) =>
          p.salesChannels.includes(c as Product["salesChannels"][number]),
        ),
      );
    }

    // 상태 필터
    if (params.status) {
      filtered = filtered.filter((p) => p.status === params.status);
    }

    // 정렬
    this.sortProducts(filtered, params.sortBy);

    // 페이지네이션
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / params.size);
    const start = (params.page - 1) * params.size;
    const items = filtered.slice(start, start + params.size);

    return {
      items,
      pagination: {
        page: params.page,
        size: params.size,
        totalItems,
        totalPages,
      },
    };
  }

  getProductById(id: string): Product {
    const product = this.repo.findProductById(id);
    if (!product) {
      throw new NotFoundError("PRODUCT", id);
    }
    return product;
  }

  createProduct(data: CreateProductParams): Product {
    const brand = this.repo.findBrandById(data.brandId);
    const category = this.repo.findCategoryById(data.categoryId);

    if (!brand || !category) {
      throw new BadRequestError(
        "유효하지 않은 브랜드 또는 카테고리입니다.",
        "INVALID_REFERENCE",
      );
    }

    const discountRate =
      data.originalPrice > data.salePrice
        ? Math.round((1 - data.salePrice / data.originalPrice) * 100)
        : 0;

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: data.name,
      slug: data.name.replace(/\s+/g, "-").toLowerCase(),
      brand,
      category,
      description: data.description,
      shortDescription: data.shortDescription,
      originalPrice: data.originalPrice,
      salePrice: data.salePrice,
      discountRate,
      images: [],
      options: [],
      tags: data.tags,
      salesChannels: data.salesChannels,
      status: data.status,
      reviewSummary: {
        averageRating: 0,
        totalCount: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
      volume: data.volume,
      skinType: data.skinType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.repo.createProduct(newProduct);
  }

  updateProduct(id: string, data: CreateProductParams): Product {
    const idx = this.repo.findProductIndex(id);
    if (idx === -1) {
      throw new NotFoundError("PRODUCT", id);
    }

    const existing = this.repo.findAllProducts()[idx];
    const discountRate =
      data.originalPrice > data.salePrice
        ? Math.round((1 - data.salePrice / data.originalPrice) * 100)
        : 0;

    const updated: Product = {
      ...existing,
      name: data.name,
      description: data.description,
      shortDescription: data.shortDescription,
      originalPrice: data.originalPrice,
      salePrice: data.salePrice,
      discountRate,
      tags: data.tags,
      salesChannels: data.salesChannels,
      status: data.status,
      volume: data.volume,
      skinType: data.skinType,
      updatedAt: new Date().toISOString(),
    };

    return this.repo.updateProduct(idx, updated);
  }

  deleteProduct(id: string): { message: string; id: string } {
    const idx = this.repo.findProductIndex(id);
    if (idx === -1) {
      throw new NotFoundError("PRODUCT", id);
    }
    const deleted = this.repo.deleteProduct(idx);
    return { message: "상품이 삭제되었습니다.", id: deleted.id };
  }

  getCategories() {
    return this.repo.findAllCategories();
  }

  getBrands() {
    return this.repo.findAllBrands();
  }

  private sortProducts(products: Product[], sortBy: string): void {
    switch (sortBy) {
      case "price_asc":
        products.sort((a, b) => a.salePrice - b.salePrice);
        break;
      case "price_desc":
        products.sort((a, b) => b.salePrice - a.salePrice);
        break;
      case "rating":
        products.sort(
          (a, b) =>
            b.reviewSummary.averageRating - a.reviewSummary.averageRating,
        );
        break;
      case "reviews":
        products.sort(
          (a, b) => b.reviewSummary.totalCount - a.reviewSummary.totalCount,
        );
        break;
      default:
        products.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
    }
  }
}
