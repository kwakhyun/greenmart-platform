import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const orderSchema = z.object({
  customer: z.object({
    name: z.string().min(1),
    phone: z.string().min(8),
    address: z.string().min(5),
    note: z.string().optional(),
  }),
  deliverySlot: z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    time: z.string().min(1),
    capacity: z.string().min(1),
  }),
  subscriptionPlan: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    summary: z.string().min(1),
    discount: z.string().min(1),
  }),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        unit: z.string().min(1),
        price: z.number().int().nonnegative(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  pricing: z.object({
    subtotal: z.number().int().nonnegative(),
    deliveryFee: z.number().int().nonnegative(),
    planDiscount: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
  }),
});

export async function POST(request: NextRequest) {
  const parsed = orderSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { message: "주문 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const orderId = `GMF-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const payload = {
    orderId,
    acceptedAt: new Date().toISOString(),
    source: "greenmart-fresh-web",
    ...parsed.data,
  };

  const webhookUrl = process.env.GREENMART_ORDER_WEBHOOK_URL;

  if (webhookUrl) {
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      return NextResponse.json(
        { message: "주문 수신 시스템으로 전달하지 못했습니다." },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({
    orderId,
    forwarded: Boolean(webhookUrl),
    message: "주문 요청이 접수되었습니다.",
  });
}
