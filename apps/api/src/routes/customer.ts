import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { CustomerFormSchema } from "@greenmart/shared";
import {
  customers,
  coupons,
  promotions,
  customerVoices,
} from "../data/customer";
import { validate } from "../middleware/validate";

const router = Router();

// ============================================================
// GET /api/customer/members — 회원 목록 조회
// ============================================================
const MemberListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  grade: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]).optional(),
  status: z.enum(["ACTIVE", "DORMANT", "WITHDRAWN"]).optional(),
  joinChannel: z.enum(["ONLINE", "OFFLINE", "APP", "GLOBAL"]).optional(),
});

router.get(
  "/members",
  validate({ query: MemberListQuerySchema }),
  (req: Request, res: Response) => {
    const { page, size, search, grade, status, joinChannel } =
      req.query as unknown as z.infer<typeof MemberListQuerySchema>;
    let filtered = [...customers];

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s),
      );
    }
    if (grade) filtered = filtered.filter((c) => c.grade === grade);
    if (status) filtered = filtered.filter((c) => c.status === status);
    if (joinChannel)
      filtered = filtered.filter((c) => c.joinChannel === joinChannel);

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / size);
    const start = (page - 1) * size;
    const items = filtered.slice(start, start + size);

    res.json({
      items,
      pagination: { page, size, totalItems, totalPages },
      summary: {
        total: customers.length,
        PLATINUM: customers.filter((c) => c.grade === "PLATINUM").length,
        GOLD: customers.filter((c) => c.grade === "GOLD").length,
        SILVER: customers.filter((c) => c.grade === "SILVER").length,
        BRONZE: customers.filter((c) => c.grade === "BRONZE").length,
      },
    });
  },
);

// ============================================================
// POST /api/customer/members — 회원 등록
// ============================================================
router.post(
  "/members",
  validate({ body: CustomerFormSchema }),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as z.infer<typeof CustomerFormSchema>;
      const newCustomer = {
        id: `cust-${Date.now()}`,
        email: data.email,
        name: data.name,
        phone: data.phone,
        grade: data.grade,
        status: data.status,
        joinChannel: data.joinChannel,
        points: 0,
        coupons: 0,
        totalPurchaseAmount: 0,
        totalOrders: 0,
        lastLoginAt: new Date().toISOString(),
        joinedAt: new Date().toISOString(),
      };
      customers.push(newCustomer);
      res.status(201).json(newCustomer);
    } catch (err) {
      next(err);
    }
  },
);

// ============================================================
// DELETE /api/customer/members/:id — 회원 삭제
// ============================================================
router.delete("/members/:id", (req: Request, res: Response) => {
  const idx = customers.findIndex((c) => c.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({
      status: 404,
      message: "회원을 찾을 수 없습니다.",
      code: "CUSTOMER_NOT_FOUND",
    });
    return;
  }
  const deleted = customers.splice(idx, 1)[0];
  res.json({ message: "회원이 삭제되었습니다.", id: deleted.id });
});

// ============================================================
// GET /api/customer/members/:id — 회원 상세
// ============================================================
router.get("/members/:id", (req: Request, res: Response) => {
  const customer = customers.find((c) => c.id === req.params.id);
  if (!customer) {
    res.status(404).json({
      status: 404,
      message: "회원을 찾을 수 없습니다.",
      code: "CUSTOMER_NOT_FOUND",
    });
    return;
  }
  res.json(customer);
});

// ============================================================
// GET /api/customer/promotions — 프로모션 목록
// ============================================================
router.get("/promotions", (req: Request, res: Response) => {
  const activeOnly = req.query.active === "true";
  const result = activeOnly ? promotions.filter((p) => p.isActive) : promotions;
  res.json(result);
});

// ============================================================
// GET /api/customer/promotions/:id — 프로모션 상세
// ============================================================
router.get("/promotions/:id", (req: Request, res: Response) => {
  const promo = promotions.find((p) => p.id === req.params.id);
  if (!promo) {
    res.status(404).json({
      status: 404,
      message: "프로모션을 찾을 수 없습니다.",
      code: "PROMOTION_NOT_FOUND",
    });
    return;
  }
  res.json(promo);
});

// ============================================================
// GET /api/customer/coupons — 쿠폰 목록
// ============================================================
router.get("/coupons", (_req: Request, res: Response) => {
  res.json(coupons);
});

// ============================================================
// GET /api/customer/voc — 고객의 소리 목록
// ============================================================
const VocQuerySchema = z.object({
  type: z.enum(["INQUIRY", "COMPLAINT", "SUGGESTION", "COMPLIMENT"]).optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
});

router.get(
  "/voc",
  validate({ query: VocQuerySchema }),
  (req: Request, res: Response) => {
    const { type, status, priority } = req.query as unknown as z.infer<
      typeof VocQuerySchema
    >;
    let filtered = [...customerVoices];

    if (type) filtered = filtered.filter((v) => v.type === type);
    if (status) filtered = filtered.filter((v) => v.status === status);
    if (priority) filtered = filtered.filter((v) => v.priority === priority);

    const summary = {
      total: customerVoices.length,
      pending: customerVoices.filter((v) => v.status === "PENDING").length,
      inProgress: customerVoices.filter((v) => v.status === "IN_PROGRESS")
        .length,
      resolved: customerVoices.filter(
        (v) => v.status === "RESOLVED" || v.status === "CLOSED",
      ).length,
    };

    res.json({ items: filtered, summary });
  },
);

// ============================================================
// GET /api/customer/voc/:id — VOC 상세
// ============================================================
router.get("/voc/:id", (req: Request, res: Response) => {
  const voc = customerVoices.find((v) => v.id === req.params.id);
  if (!voc) {
    res.status(404).json({
      status: 404,
      message: "VOC를 찾을 수 없습니다.",
      code: "VOC_NOT_FOUND",
    });
    return;
  }
  res.json(voc);
});

export default router;
