import { Controller, Get } from "@nestjs/common";
import { getServiceCatalog } from "../../lib/greenmart-db";

@Controller("service")
export class ServiceController {
  @Get("catalog")
  getCatalog() {
    return getServiceCatalog();
  }
}
