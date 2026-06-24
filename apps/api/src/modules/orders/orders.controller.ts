import { Body, Controller, Headers, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import { ZodError } from "zod";
import { submitOrderRequest } from "../../lib/order-requests";

@Controller("orders")
export class OrdersController {
  @Post()
  async create(
    @Body() body: unknown,
    @Headers("idempotency-key") idempotencyKey: string | undefined,
    @Res() response: Response,
  ) {
    try {
      const { orderRequest, duplicate } = await submitOrderRequest(body, {
        idempotencyKey,
        webhookUrl: process.env.GREENMART_ORDER_WEBHOOK_URL,
      });

      return response.status(duplicate ? 200 : 202).json({
        orderId: orderRequest.orderNumber,
        requestId: orderRequest.id,
        duplicate,
        forwarded: orderRequest.webhookSyncStatus === "DELIVERED",
        webhookSyncStatus: orderRequest.webhookSyncStatus,
        fulfillmentRisk: orderRequest.fulfillmentRisk,
        slaDueAt: orderRequest.slaDueAt,
        message: duplicate
          ? "이미 접수된 주문 요청입니다."
          : "주문 요청이 접수되었습니다.",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return response
          .status(400)
          .json({ message: "주문 요청 형식이 올바르지 않습니다." });
      }

      return response.status(422).json({
        message:
          error instanceof Error
            ? error.message
            : "주문 요청을 접수하지 못했습니다.",
      });
    }
  }
}
