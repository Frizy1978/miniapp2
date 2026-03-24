import { Module } from "@nestjs/common";

import { TelegramBotClient } from "./telegram-bot.client";
import { TelegramBotService } from "./telegram-bot.service";

@Module({
  providers: [TelegramBotClient, TelegramBotService],
  exports: [TelegramBotClient, TelegramBotService]
})
export class TelegramBotModule {}
