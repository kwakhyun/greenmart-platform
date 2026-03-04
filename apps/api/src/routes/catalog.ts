import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ProductFormSchema } from "@greenmart/shared";
import { validate } from "../middleware/validate";
import { CatalogService, ProductListParams } from "../services/catalog.service";
import { CatalogRepository } from "../repositories/catalog.repository";

const router = Router();
const catalogService = new CatalogService(new CatalogRepository());

// ============================================================
// GET /api/catalog/products — 상품 목록 조회 (필터, 검색, 페이지네이션)
// ============================================================
const ProductListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(12),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  tags: z.string().optional(),
  channels: z.string().optional(),
  status: z
    .enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK", "DISCONTINUED"])
    .optional(),
  sortBy: z
    .enum(["latest", "price_asc", "price_desc", "rating", "reviews"])
    .default("latest"),
});

router.get(
  "/products",
  validate({ query: ProductListQuerySchema }),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = req.query as unknown as ProductListParams;
      const result = catalogService.getProducts(params);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

// ============================================================
// GET /api/catalog/products/:id — 상품 상세
// ============================================================
router.get(
  "/products/:id",
  (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const product = catalogService.getProductById(req.params.id);
      res.json(product);
    } catch (err) {
      next(err);
    }
  },
);

// ============================================================
// POST /api/catalog/products — 상품 등록
// ============================================================
router.post(
  "/products",
  validate({ body: ProductFormSchema }),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = catalogService.createProduct(req.body);
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  },
);

// ============================================================
// PUT /api/catalog/products/:id — 상품 수정
// ============================================================
router.put(
  "/products/:id",
  validate({ body: ProductFormSchema }),
  (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const product = catalogService.updateProduct(req.params.id, req.body);
      res.json(product);
    } catch (err) {
      next(err);
    }
  },
);

// ============================================================
// DELETE /api/catalog/products/:id — 상품 삭제
// ============================================================
router.delete(
  "/products/:id",
  (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const result = catalogService.deleteProduct(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

// ============================================================
// GET /api/catalog/categories — 카테고리 목록
// ============================================================
router.get("/categories", (_req: Request, res: Response) => {
  res.json(catalogService.getCategories());
});

// ============================================================
// GET /api/catalog/brands — 브랜드 목록
// ============================================================
router.get("/brands", (_req: Request, res: Response) => {
  res.json(catalogService.getBrands());
});

export default router;
