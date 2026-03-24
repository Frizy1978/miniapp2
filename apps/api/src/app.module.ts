import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import appEnvironment from "./common/config/env";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AdminModule } from "./modules/admin/admin.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BatchesModule } from "./modules/batches/batches.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { HealthModule } from "./modules/health/health.module";
import { TelegramBotModule } from "./modules/integrations/telegram-bot/telegram-bot.module";
import { WooCommerceModule } from "./modules/integrations/woocommerce/woocommerce.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [appEnvironment]
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CatalogModule,
    BatchesModule,
    OrdersModule,
    AdminModule,
    TelegramBotModule,
    WooCommerceModule
  ]
})
export class AppModule {}
