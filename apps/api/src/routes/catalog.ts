import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ProductFormSchema } from "@greenmart/shared";
import { validate } from "../middleware/validate";
import { CatalogService, ProductListParams } from "../services/catalog.service";
import { CatalogRepository } from "../repositories/catalog.repository";

const router = Router();
const catalogService = new CatalogService(new CatalogRepository());

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

router.get("/categories", (_req: Request, res: Response) => {
  res.json(catalogService.getCategories());
});

router.get("/brands", (_req: Request, res: Response) => {
  res.json(catalogService.getBrands());
});

export default router;
