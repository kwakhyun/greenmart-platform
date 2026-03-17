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
import { responseTimeMiddleware } from "./middleware/response-time";
import { rateLimiter } from "./middleware/rate-limiter";
import { swaggerSpec } from "./swagger";
import { logger } from "./lib/logger";

export function createApp() {
  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
    : ["http://localhost:3000"];

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  app.options(
    "*",
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(responseTimeMiddleware);
  app.use(rateLimiter({ windowMs: 60_000, maxRequests: 100 }));

  app.use(
    morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
      stream: { write: (message: string) => logger.http(message.trim()) },
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "GreenMart API Docs",
    }),
  );

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  app.use("/api/catalog", catalogRouter);
  app.use("/api/customer", customerRouter);
  app.use("/api/inventory", inventoryRouter);
  app.use("/api/settlement", settlementRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
