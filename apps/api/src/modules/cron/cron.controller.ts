import { Controller, Get, Headers, Res } from "@nestjs/common";
import type { Response } from "express";
import { retryOrderRequestWebhooks } from "../../lib/order-requests";

@Controller("cron")
export class CronController {
  @Get("outbox")
  async retryOutbox(
    @Headers("authorization") authorization: string | undefined,
    @Res() response: Response,
  ) {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return response
        .status(503)
        .json({ message: "CRON_SECRET is not configured." });
    }

    if (authorization !== `Bearer ${cronSecret}`) {
      return response.status(401).json({ message: "Unauthorized" });
    }

    const result = await retryOrderRequestWebhooks({
      webhookUrl: process.env.GREENMART_ORDER_WEBHOOK_URL,
    });

    return response.json({ ok: true, ...result });
  }
}
