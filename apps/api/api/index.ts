import { createApp } from "../src/app";
import type { IncomingMessage, ServerResponse } from "http";

const app = createApp();

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // Vercel Serverless에서 CORS preflight 즉시 응답
  if (req.method === "OPTIONS") {
    const origin = process.env.CORS_ORIGIN || "http://localhost:3000";
    res.setHeader("Access-Control-Allow-Origin", origin.split(",")[0].trim());
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.statusCode = 204;
    res.end();
    return;
  }
  return app(req, res);
}
