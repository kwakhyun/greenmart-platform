import { Router, Request, Response } from "express";
import { z } from "zod";
import { OrderStatusUpdateSchema } from "@greenmart/shared";
import { orders, settlements, dashboardSummary } from "../data/settlement";
import { validate } from "../middleware/validate";

const router = Router();

// ============================================================
// GET /api/settlement/orders — 주문 목록 조회
// ============================================================
const OrderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
      "PARTIALLY_REFUNDED",
    ])
    .optional(),
  search: z.string().optional(),
  paymentMethod: z
    .enum([
      "CREDIT_CARD",
      "DEBIT_CARD",
      "BANK_TRANSFER",
      "VIRTUAL_ACCOUNT",
      "KAKAO_PAY",
      "NAVER_PAY",
      "TOSS_PAY",
      "POINTS",
    ])
    .optional(),
});

router.get(
  "/orders",
  validate({ query: OrderQuerySchema }),
  (req: Request, res: Response) => {
    const { page, size, status, search, paymentMethod } =
      req.query as unknown as z.infer<typeof OrderQuerySchema>;
    let filtered = [...orders];

    if (status) filtered = filtered.filter((o) => o.status === status);
    if (paymentMethod)
      filtered = filtered.filter((o) => o.paymentMethod === paymentMethod);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(s) ||
          o.customerName.toLowerCase().includes(s),
      );
    }

    const statusCounts = {
      total: orders.length,
      PENDING: orders.filter((o) => o.status === "PENDING").length,
      CONFIRMED: orders.filter((o) => o.status === "CONFIRMED").length,
      PROCESSING: orders.filter((o) => o.status === "PROCESSING").length,
      DELIVERED: orders.filter((o) => o.status === "DELIVERED").length,
      CANCELLED: orders.filter((o) => o.status === "CANCELLED").length,
    };

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / size);
    const start = (page - 1) * size;
    const items = filtered.slice(start, start + size);

    res.json({
      items,
      pagination: { page, size, totalItems, totalPages },
      statusCounts,
    });
  },
);

// ============================================================
// GET /api/settlement/orders/:id — 주문 상세
// ============================================================
router.get("/orders/:id", (req: Request, res: Response) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    res.status(404).json({
      status: 404,
      message: "주문을 찾을 수 없습니다.",
      code: "ORDER_NOT_FOUND",
    });
    return;
  }
  res.json(order);
});

// ============================================================
// PATCH /api/settlement/orders/:id/status — 주문 상태 변경
// ============================================================
router.patch(
  "/orders/:id/status",
  validate({ body: OrderStatusUpdateSchema }),
  (req: Request, res: Response) => {
    const order = orders.find((o) => o.id === req.params.id);
    if (!order) {
      res.status(404).json({
        status: 404,
        message: "주문을 찾을 수 없습니다.",
        code: "ORDER_NOT_FOUND",
      });
      return;
    }
    const { status } = req.body as z.infer<typeof OrderStatusUpdateSchema>;
    order.status = status;
    res.json(order);
  },
);

// ============================================================
// GET /api/settlement/settlements — 정산 내역 조회
// ============================================================
const SettlementQuerySchema = z.object({
  period: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  partnerId: z.string().optional(),
  status: z
    .enum(["PENDING", "CALCULATED", "CONFIRMED", "PAID", "DISPUTED"])
    .optional(),
});

router.get(
  "/settlements",
  validate({ query: SettlementQuerySchema }),
  (req: Request, res: Response) => {
    const { period, partnerId, status } = req.query as unknown as z.infer<
      typeof SettlementQuerySchema
    >;
    let filtered = [...settlements];

    if (period) filtered = filtered.filter((s) => s.period === period);
    if (partnerId) filtered = filtered.filter((s) => s.partnerId === partnerId);
    if (status) filtered = filtered.filter((s) => s.status === status);

    const summary = {
      totalSales: filtered.reduce((sum, s) => sum + s.totalSales, 0),
      totalRefunds: filtered.reduce((sum, s) => sum + s.totalRefunds, 0),
      totalCommission: filtered.reduce((sum, s) => sum + s.commissionAmount, 0),
      totalNet: filtered.reduce((sum, s) => sum + s.netAmount, 0),
    };

    res.json({ items: filtered, summary });
  },
);

// ============================================================
// GET /api/settlement/settlements/:id — 정산 상세
// ============================================================
router.get("/settlements/:id", (req: Request, res: Response) => {
  const settlement = settlements.find((s) => s.id === req.params.id);
  if (!settlement) {
    res.status(404).json({
      status: 404,
      message: "정산 내역을 찾을 수 없습니다.",
      code: "SETTLEMENT_NOT_FOUND",
    });
    return;
  }
  res.json(settlement);
});

// ============================================================
// GET /api/settlement/dashboard — 대시보드 요약
// ============================================================
router.get("/dashboard", (_req: Request, res: Response) => {
  res.json(dashboardSummary);
});

export default router;
