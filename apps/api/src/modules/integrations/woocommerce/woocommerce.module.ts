import { Module } from "@nestjs/common";

import { PrismaModule } from "../../../common/prisma/prisma.module";
import { WooCommerceClient } from "./woocommerce.client";
import { WooCommerceService } from "./woocommerce.service";

@Module({
  imports: [PrismaModule],
  providers: [WooCommerceClient, WooCommerceService],
  exports: [WooCommerceClient, WooCommerceService]
})
export class WooCommerceModule {}
