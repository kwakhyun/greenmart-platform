import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import catalogRouter from "./routes/catalog";
import customerRouter from "./routes/customer";
import inventoryRouter from "./routes/inventory";
import settlementRouter from "./routes/settlement";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { swaggerSpec } from "./swagger";
import { logger } from "./lib/logger";

export function createApp() {
  const app = express();

  // ============================================================
  // 글로벌 미들웨어
  // ============================================================
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      credentials: true,
    }),
  );
  app.use(
    morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
      stream: { write: (message: string) => logger.http(message.trim()) },
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ============================================================
  // Swagger API 문서
  // ============================================================
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "GreenMart API Docs",
    }),
  );

  // ============================================================
  // Health check
  // ============================================================
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // ============================================================
  // 도메인별 라우터
  // ============================================================
  app.use("/api/catalog", catalogRouter);
  app.use("/api/customer", customerRouter);
  app.use("/api/inventory", inventoryRouter);
  app.use("/api/settlement", settlementRouter);

  // ============================================================
  // 에러 핸들링
  // ============================================================
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
