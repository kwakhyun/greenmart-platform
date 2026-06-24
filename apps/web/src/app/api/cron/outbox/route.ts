import { NextRequest } from "next/server";
import { proxyApiRequest } from "@/lib/api-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return proxyApiRequest(request, "cron/outbox");
}
