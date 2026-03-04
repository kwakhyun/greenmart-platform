import { Router, Request, Response } from "express";
import { z } from "zod";
import {
  warehouses,
  inventoryItems,
  deliveries,
  stockMovements,
} from "../data/inventory";
import { validate } from "../middleware/validate";

const router = Router();

// ============================================================
// GET /api/inventory/warehouses — 창고 목록
// ============================================================
router.get("/warehouses", (_req: Request, res: Response) => {
  res.json(warehouses);
});

// ============================================================
// GET /api/inventory/stock — 재고 목록 조회
// ============================================================
const StockQuerySchema = z.object({
  warehouseId: z.string().optional(),
  status: z
    .enum(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "RESERVED"])
    .optional(),
  search: z.string().optional(),
});

router.get(
  "/stock",
  validate({ query: StockQuerySchema }),
  (req: Request, res: Response) => {
    const { warehouseId, status, search } = req.query as unknown as z.infer<
      typeof StockQuerySchema
    >;
    let filtered = [...inventoryItems];

    if (warehouseId)
      filtered = filtered.filter((i) => i.warehouseId === warehouseId);
    if (status) filtered = filtered.filter((i) => i.status === status);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.productName.toLowerCase().includes(s) ||
          i.sku.toLowerCase().includes(s),
      );
    }

    const summary = {
      total: inventoryItems.length,
      lowStock: inventoryItems.filter((i) => i.status === "LOW_STOCK").length,
      outOfStock: inventoryItems.filter((i) => i.status === "OUT_OF_STOCK")
        .length,
    };

    res.json({ items: filtered, summary });
  },
);

// ============================================================
// GET /api/inventory/deliveries — 배송 목록
// ============================================================
const DeliveryQuerySchema = z.object({
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "PICKING",
      "PACKING",
      "SHIPPED",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "RETURNED",
    ])
    .optional(),
  type: z
    .enum(["STANDARD", "EXPRESS", "SAME_DAY", "PICKUP", "GLOBAL"])
    .optional(),
});

router.get(
  "/deliveries",
  validate({ query: DeliveryQuerySchema }),
  (req: Request, res: Response) => {
    const { status, type } = req.query as unknown as z.infer<
      typeof DeliveryQuerySchema
    >;
    let filtered = [...deliveries];

    if (status) filtered = filtered.filter((d) => d.status === status);
    if (type) filtered = filtered.filter((d) => d.type === type);

    res.json(filtered);
  },
);

// ============================================================
// GET /api/inventory/deliveries/:id — 배송 상세
// ============================================================
router.get("/deliveries/:id", (req: Request, res: Response) => {
  const delivery = deliveries.find((d) => d.id === req.params.id);
  if (!delivery) {
    res.status(404).json({
      status: 404,
      message: "배송 정보를 찾을 수 없습니다.",
      code: "DELIVERY_NOT_FOUND",
    });
    return;
  }
  res.json(delivery);
});

// ============================================================
// GET /api/inventory/movements — 재고 이동 내역
// ============================================================
router.get("/movements", (_req: Request, res: Response) => {
  res.json(stockMovements);
});

export default router;
