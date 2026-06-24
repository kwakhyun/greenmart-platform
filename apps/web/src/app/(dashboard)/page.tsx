import { GreenMartService } from "@/components/service/GreenMartService";
import type { ServiceCatalog } from "@/components/service/GreenMartService";
import { getApiBaseUrl } from "@/lib/api-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getServiceCatalog() {
  const response = await fetch(`${getApiBaseUrl()}/service/catalog`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("서비스 카탈로그를 불러오지 못했습니다.");
  }

  return response.json() as Promise<ServiceCatalog>;
}

export default async function HomePage() {
  return <GreenMartService catalog={await getServiceCatalog()} />;
}
