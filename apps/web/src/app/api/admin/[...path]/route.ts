import { NextRequest } from "next/server";
import { proxyApiRequest } from "@/lib/api-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    path?: string[];
  };
};

function target(context: RouteContext) {
  return ["admin", ...(context.params.path ?? [])].join("/");
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyApiRequest(request, target(context));
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyApiRequest(request, target(context));
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyApiRequest(request, target(context));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyApiRequest(request, target(context));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyApiRequest(request, target(context));
}
