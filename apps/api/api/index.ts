import "reflect-metadata";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import express, { type Express } from "express";
import { AppModule } from "../src/app.module";

let cachedServer: Express | null = null;

async function createServer() {
  if (cachedServer) return cachedServer;

  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ["error", "warn", "log"],
  });

  app.setGlobalPrefix("api");
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim()) ??
      true,
    credentials: true,
  });
  await app.init();

  cachedServer = server;
  return server;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const server = await createServer();
  return server(request, response);
}
