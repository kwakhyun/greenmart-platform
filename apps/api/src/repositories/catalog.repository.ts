import { products, categories, brands } from "../data/catalog";
import type { Product, Category, Brand } from "@greenmart/shared";

/**
 * Catalog Repository — 데이터 접근 계층
 * 실제 프로젝트에서는 DB 접근으로 교체됩니다.
 */
export class CatalogRepository {
  findAllProducts(): Product[] {
    return [...products];
  }

  findProductById(id: string): Product | undefined {
    return products.find((p) => p.id === id);
  }

  findProductIndex(id: string): number {
    return products.findIndex((p) => p.id === id);
  }

  createProduct(product: Product): Product {
    products.push(product);
    return product;
  }

  updateProduct(index: number, product: Product): Product {
    products[index] = product;
    return product;
  }

  deleteProduct(index: number): Product {
    return products.splice(index, 1)[0];
  }

  findAllCategories(): Category[] {
    return [...categories];
  }

  findCategoryById(id: string): Category | null {
    for (const cat of categories) {
      if (cat.id === id) return cat;
      if (cat.children) {
        const child = cat.children.find((c) => c.id === id);
        if (child) return child;
      }
    }
    return null;
  }

  findAllBrands(): Brand[] {
    return [...brands];
  }

  findBrandById(id: string): Brand | undefined {
    return brands.find((b) => b.id === id);
  }
}

export const catalogRepository = new CatalogRepository();
