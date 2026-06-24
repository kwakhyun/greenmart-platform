import { NextRequest, NextResponse } from "next/server";

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  const configured =
    process.env.GREENMART_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_ADMIN_API_URL?.replace(/\/admin\/?$/, "");

  if (configured) return normalizeBaseUrl(configured);

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:4000/api";
  }

  throw new Error(
    "GREENMART_API_URL 또는 NEXT_PUBLIC_API_URL을 설정해야 합니다.",
  );
}

function copyRequestHeaders(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  return headers;
}

export async function proxyApiRequest(
  request: NextRequest,
  targetPath: string,
) {
  const search = request.nextUrl.search;
  const url = `${getApiBaseUrl()}/${targetPath.replace(/^\/+/, "")}${search}`;
  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";

  const upstream = await fetch(url, {
    method,
    headers: copyRequestHeaders(request),
    body: hasBody ? await request.text() : undefined,
    cache: "no-store",
  });

  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}
