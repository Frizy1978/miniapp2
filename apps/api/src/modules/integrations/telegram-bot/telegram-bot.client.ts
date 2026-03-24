import { BadGatewayException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { AppEnvironment } from "../../../common/config/env";
import type { TelegramApiResponse, TelegramBotInfo, TelegramUpdate } from "./telegram-bot.types";

@Injectable()
export class TelegramBotClient {
  constructor(private readonly configService: ConfigService<AppEnvironment, true>) {}

  isConfigured(): boolean {
    const botToken = this.configService.get("telegram.botToken", { infer: true });

    return Boolean(botToken && botToken !== "replace_me");
  }

  async getMe(): Promise<TelegramBotInfo> {
    return this.call<TelegramBotInfo>("getMe");
  }

  async deleteWebhook() {
    return this.call("deleteWebhook", {
      drop_pending_updates: false
    });
  }

  async getUpdates(offset?: number) {
    return this.call<TelegramUpdate[]>("getUpdates", {
      allowed_updates: ["message"],
      offset,
      timeout: 25
    });
  }

  async sendMessage(chatId: number | string, text: string, replyMarkup?: Record<string, unknown>) {
    return this.call("sendMessage", {
      chat_id: chatId,
      reply_markup: replyMarkup,
      text
    });
  }

  async setChatMenuButton() {
    const miniAppUrl = this.configService.get("telegram.miniAppUrl", { infer: true });

    return this.call("setChatMenuButton", {
      menu_button: {
        text: "Открыть каталог",
        type: "web_app",
        web_app: {
          url: miniAppUrl
        }
      }
    });
  }

  async setMyCommands() {
    return this.call("setMyCommands", {
      commands: [
        {
          command: "start",
          description: "Открыть приветственное сообщение"
        },
        {
          command: "app",
          description: "Открыть Mini App"
        }
      ]
    });
  }

  private async call<T = boolean>(method: string, payload?: Record<string, unknown>): Promise<T> {
    const botToken = this.configService.get("telegram.botToken", { infer: true });

    if (!botToken || botToken === "replace_me") {
      throw new BadGatewayException("Telegram bot token is not configured");
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
      body: payload ? JSON.stringify(payload) : undefined,
      headers: {
        "Content-Type": "application/json"
      },
      method: payload ? "POST" : "GET"
    });

    if (!response.ok) {
      throw new BadGatewayException(`Telegram Bot API request failed with status ${response.status}`);
    }

    const body = (await response.json()) as TelegramApiResponse<T>;

    if (!body.ok) {
      throw new BadGatewayException(body.description ?? "Telegram Bot API returned an error");
    }

    return body.result;
  }
}
