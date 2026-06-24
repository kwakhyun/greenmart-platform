import { Module } from "@nestjs/common";
import { AdminController } from "./modules/admin/admin.controller";
import { AdminService } from "./modules/admin/admin.service";
import { CronController } from "./modules/cron/cron.controller";
import { HealthController } from "./modules/health/health.controller";
import { OrdersController } from "./modules/orders/orders.controller";
import { ServiceController } from "./modules/service/service.controller";

@Module({
  controllers: [
    AdminController,
    CronController,
    HealthController,
    OrdersController,
    ServiceController,
  ],
  providers: [AdminService],
})
export class AppModule {}
