import { Module } from "@nestjs/common";

import { BatchesModule } from "../batches/batches.module";
import { TelegramBotModule } from "../integrations/telegram-bot/telegram-bot.module";
import { WooCommerceModule } from "../integrations/woocommerce/woocommerce.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { PdfExportService } from "./pdf-export.service";

@Module({
  imports: [BatchesModule, WooCommerceModule, TelegramBotModule],
  controllers: [AdminController],
  providers: [AdminService, PdfExportService]
})
export class AdminModule {}
