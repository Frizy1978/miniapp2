import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { AppEnvironment } from "../../../common/config/env";
import { TelegramBotClient } from "./telegram-bot.client";

@Injectable()
export class TelegramBotService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramBotService.name);
  private isPolling = false;
  private isStopping = false;
  private updateOffset = 0;

  constructor(
    private readonly configService: ConfigService<AppEnvironment, true>,
    private readonly telegramBotClient: TelegramBotClient
  ) {}

  async onModuleInit(): Promise<void> {
    if (this.configService.get("telegram.botEnablePolling", { infer: true }) && this.telegramBotClient.isConfigured()) {
      try {
        await this.telegramBotClient.deleteWebhook();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown deleteWebhook error";
        this.logger.warn(`Telegram deleteWebhook failed during startup: ${message}`);
      }

      void this.startPollingLoop();
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.isStopping = true;
  }

  async getStatus() {
    const configured = this.telegramBotClient.isConfigured();
    let bot: Awaited<ReturnType<TelegramBotClient["getMe"]>> | null = null;
    let apiReachable = false;
    let lastError: string | null = null;

    if (configured) {
      try {
        bot = await this.telegramBotClient.getMe();
        apiReachable = true;
      } catch (error) {
        lastError = error instanceof Error ? error.message : "Unknown Telegram API error";
      }
    }

    return {
      apiReachable,
      bot,
      configured,
      lastError,
      menuButtonUrl: this.configService.get("telegram.miniAppUrl", { infer: true }),
      pollingEnabled: this.configService.get("telegram.botEnablePolling", { infer: true }),
      pollingRunning: this.isPolling
    };
  }

  async setupBotEntryPoints() {
    const [menuButtonResult, commandsResult] = await Promise.all([
      this.telegramBotClient.setChatMenuButton(),
      this.telegramBotClient.setMyCommands()
    ]);

    return {
      commandsConfigured: commandsResult,
      menuButtonConfigured: menuButtonResult
    };
  }

  async sendStartMessage(chatId: number | string) {
    return this.telegramBotClient.sendMessage(chatId, this.buildWelcomeText(), this.buildWebAppKeyboard());
  }

  private async startPollingLoop(): Promise<void> {
    if (this.isPolling) {
      return;
    }

    this.isPolling = true;
    this.logger.log("Telegram bot polling enabled");

    while (!this.isStopping) {
      try {
        const updates = await this.telegramBotClient.getUpdates(this.updateOffset);

        for (const update of updates) {
          this.updateOffset = update.update_id + 1;
          await this.handleUpdate(update);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown polling error";
        this.logger.warn(`Telegram polling iteration failed: ${message}`);
        await this.delay(3_000);
      }
    }

    this.isPolling = false;
  }

  private async handleUpdate(update: Awaited<ReturnType<TelegramBotClient["getUpdates"]>>[number]) {
    const text = update.message?.text?.trim().toLowerCase();
    const chatId = update.message?.chat.id;

    if (!chatId || !text) {
      return;
    }

    if (text === "/start" || text === "/app") {
      await this.telegramBotClient.sendMessage(chatId, this.buildWelcomeText(), this.buildWebAppKeyboard());
    }
  }

  private buildWelcomeText(): string {
    return [
      "Fish Olha Mini App",
      "",
      "Откройте Mini App, чтобы посмотреть каталог и оформить предзаказ на ближайшую поставку."
    ].join("\n");
  }

  private buildWebAppKeyboard() {
    return {
      inline_keyboard: [
        [
          {
            text: "Открыть каталог",
            web_app: {
              url: this.configService.get("telegram.miniAppUrl", { infer: true })
            }
          }
        ]
      ]
    };
  }

  private async delay(timeoutMs: number) {
    await new Promise((resolve) => setTimeout(resolve, timeoutMs));
  }
}
