import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UseGuards
} from "@nestjs/common";
import { BatchStatus } from "@prisma/client";
import type { Response } from "express";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import type { AuthenticatedUser } from "../../common/types/request-with-user";
import { BatchesService } from "../batches/batches.service";
import { TelegramBotService } from "../integrations/telegram-bot/telegram-bot.service";
import { WooCommerceService } from "../integrations/woocommerce/woocommerce.service";
import { AdminService } from "./admin.service";
import { PdfExportService } from "./pdf-export.service";

type WooSyncBody = {
  scope?: "categories" | "products" | "full_catalog";
};

type SendBotMessageBody = {
  chatId: number | string;
};

type ListOrdersQuery = {
  batch?: string;
  limit?: string;
};

type ProductSummaryQuery = {
  batch?: string;
};

type CreateBatchBody = {
  closesAt: string;
  customerMessage?: string;
  deliveryAt: string;
  openNow?: boolean;
  startsAt?: string;
};

@Controller("admin")
@UseGuards(RolesGuard)
@Roles("admin")
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly batchesService: BatchesService,
    private readonly pdfExportService: PdfExportService,
    private readonly telegramBotService: TelegramBotService,
    private readonly wooCommerceService: WooCommerceService
  ) {}

  @Get("batches")
  async listBatches() {
    return {
      data: await this.batchesService.listBatches(),
      ok: true
    };
  }

  @Get("orders")
  async listOrders(@Query() query: ListOrdersQuery) {
    const parsedLimit = query.limit ? Number.parseInt(query.limit, 10) : undefined;

    return {
      data: await this.adminService.listOrders({
        batchCode: query.batch,
        limit: Number.isFinite(parsedLimit) ? parsedLimit : undefined
      }),
      ok: true
    };
  }

  @Get("batches/:code")
  async getBatch(@Param("code") code: string) {
    return {
      data: await this.adminService.getBatchDetails(code),
      ok: true
    };
  }

  @Get("orders/:code")
  async getOrder(@Param("code") code: string) {
    return {
      data: await this.adminService.getOrderByCode(code),
      ok: true
    };
  }

  @Get("analytics/overview")
  async getOverview() {
    return {
      data: await this.adminService.getOverview(),
      ok: true
    };
  }

  @Get("products-summary")
  async getProductsSummary(@Query() query: ProductSummaryQuery) {
    return {
      data: await this.adminService.getProductsSummary(query.batch),
      ok: true
    };
  }

  @Get("exports/customers")
  async exportCustomersPdf(
    @Query("batch") batch: string | undefined,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Res({ passthrough: true }) response: Response
  ) {
    const file = await this.pdfExportService.createCustomersPdf(batch, user);

    response.setHeader("Content-Type", "application/pdf");
    response.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);

    return new StreamableFile(file.buffer);
  }

  @Get("exports/products")
  async exportProductsPdf(
    @Query("batch") batch: string | undefined,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Res({ passthrough: true }) response: Response
  ) {
    const file = await this.pdfExportService.createProductsPdf(batch, user);

    response.setHeader("Content-Type", "application/pdf");
    response.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);

    return new StreamableFile(file.buffer);
  }

  @Post("batches")
  async createBatch(
    @Body() body: CreateBatchBody,
    @CurrentUser() user: AuthenticatedUser | undefined
  ) {
    return {
      data: user ? await this.batchesService.createBatch(body, user) : null,
      ok: true
    };
  }

  @Post("batches/:code/open")
  async openBatch(@Param("code") code: string) {
    return {
      data: await this.batchesService.changeBatchStatus(code, BatchStatus.open),
      ok: true
    };
  }

  @Post("batches/:code/close")
  async closeBatch(@Param("code") code: string) {
    return {
      data: await this.batchesService.changeBatchStatus(code, BatchStatus.closed),
      ok: true
    };
  }

  @Get("integrations/woocommerce/status")
  async getWooCommerceStatus() {
    return {
      data: await this.wooCommerceService.getSyncStatus(),
      ok: true
    };
  }

  @Post("integrations/woocommerce/sync")
  async syncWooCommerceCatalog(@Body() body: WooSyncBody) {
    return {
      data: await this.wooCommerceService.syncCatalog(body.scope ?? "full_catalog"),
      ok: true
    };
  }

  @Get("integrations/telegram-bot/status")
  async getTelegramBotStatus() {
    return {
      data: await this.telegramBotService.getStatus(),
      ok: true
    };
  }

  @Post("integrations/telegram-bot/setup")
  async setupTelegramBot() {
    return {
      data: await this.telegramBotService.setupBotEntryPoints(),
      ok: true
    };
  }

  @Post("integrations/telegram-bot/send-start")
  async sendTelegramStart(@Body() body: SendBotMessageBody) {
    return {
      data: await this.telegramBotService.sendStartMessage(body.chatId),
      ok: true
    };
  }
}
