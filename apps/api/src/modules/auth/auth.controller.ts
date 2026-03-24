import { Body, Controller, Get, Post } from "@nestjs/common";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/request-with-user";
import { AuthService } from "./auth.service";

type DevLoginRequest = {
  firstName?: string;
  initData?: string;
  lastName?: string;
  role?: "buyer" | "admin";
  telegramUserId?: string;
  username?: string;
};

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("me")
  getCurrentUser(@CurrentUser() user: AuthenticatedUser | undefined) {
    return {
      data: user ?? null,
      ok: true
    };
  }

  @Post("telegram/miniapp")
  async authenticateTelegramMiniApp(@Body() body: DevLoginRequest) {
    return {
      data: await this.authService.authenticateMiniApp(body.initData ?? ""),
      ok: true
    };
  }

  @Post("dev/login")
  getDevLoginPreview(@Body() body: DevLoginRequest) {
    const user = this.authService.resolveUserFromHeaders({
      "x-telegram-first-name": body.firstName,
      "x-telegram-last-name": body.lastName,
      "x-telegram-user-id": body.telegramUserId,
      "x-telegram-username": body.username,
      "x-user-role": body.role
    });

    return {
      data: {
        message: "Development auth fallback remains available while Telegram Mini App auth is being integrated.",
        user
      },
      ok: true
    };
  }
}
