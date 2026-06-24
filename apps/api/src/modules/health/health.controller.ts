import { Controller, Get, Res } from "@nestjs/common";
import type { Response } from "express";
import { DB_COLLECTIONS, listRecords } from "../../lib/greenmart-db";

@Controller()
export class HealthController {
  @Get("health")
  health() {
    return {
      status: "ok",
      service: "greenmart-api",
      timestamp: new Date().toISOString(),
    };
  }

  @Get("ready")
  async ready(@Res() response: Response) {
    try {
      await listRecords(DB_COLLECTIONS.catalogProducts);
      return response.json({
        status: "ready",
        database: { status: "ok" },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return response.status(503).json({
        status: "not_ready",
        database: {
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
}
