import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { AppEnvironment } from "../../common/config/env";
import type { AuthenticatedUser } from "../../common/types/request-with-user";
import { AuthSessionService } from "./auth-session.service";
import { TelegramAuthService } from "./telegram-auth.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<AppEnvironment, true>,
    private readonly authSessionService: AuthSessionService,
    private readonly telegramAuthService: TelegramAuthService
  ) {}

  async authenticateMiniApp(initData: string) {
    const user = await this.telegramAuthService.authenticateMiniApp(initData);
    const token = this.authSessionService.createSession(user);

    return {
      token,
      user
    };
  }

  resolveUserFromHeaders(headers: Record<string, string | string[] | undefined>): AuthenticatedUser | undefined {
    const bearerToken = this.extractBearerToken(headers);

    if (bearerToken) {
      return this.authSessionService.verifySession(bearerToken);
    }

    if (!this.configService.get("telegram.devMode", { infer: true })) {
      return undefined;
    }

    const telegramUserId =
      this.getHeaderValue(headers, "x-telegram-user-id") ??
      this.configService.get("telegram.devUser.telegramUserId", { infer: true }) ??
      "100000000";
    const username =
      this.getHeaderValue(headers, "x-telegram-username") ??
      this.configService.get("telegram.devUser.username", { infer: true }) ??
      "dev_buyer";
    const firstName =
      this.getHeaderValue(headers, "x-telegram-first-name") ??
      this.configService.get("telegram.devUser.firstName", { infer: true }) ??
      "Dev";
    const lastName =
      this.getHeaderValue(headers, "x-telegram-last-name") ??
      this.configService.get("telegram.devUser.lastName", { infer: true }) ??
      "Buyer";
    const explicitRole = this.getHeaderValue(headers, "x-user-role");
    const role = explicitRole === "admin" || this.isAdminTelegramId(telegramUserId) ? "admin" : "buyer";
    const displayName = [firstName, lastName, username].map((value) => value?.trim()).filter(Boolean).join(" ") || "Пользователь";

    return {
      displayName,
      firstName,
      id: `dev:${telegramUserId}`,
      isDevSession: this.configService.get("telegram.devMode", { infer: true }),
      lastName,
      role,
      telegramUserId,
      username
    };
  }

  verifySession(token: string): AuthenticatedUser {
    return this.authSessionService.verifySession(token);
  }

  private getHeaderValue(
    headers: Record<string, string | string[] | undefined>,
    key: string
  ): string | null {
    const value = headers[key];

    if (Array.isArray(value)) {
      return value[0] ?? null;
    }

    return value ?? null;
  }

  private extractBearerToken(headers: Record<string, string | string[] | undefined>): string | null {
    const authorization = this.getHeaderValue(headers, "authorization");
    const xSessionToken = this.getHeaderValue(headers, "x-session-token");

    if (xSessionToken) {
      return xSessionToken;
    }

    if (!authorization) {
      return null;
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme?.toLowerCase() !== "bearer" || !token) {
      throw new UnauthorizedException("Invalid authorization header");
    }

    return token;
  }

  private isAdminTelegramId(telegramUserId: string): boolean {
    const adminTelegramIds = this.configService.get("telegram.adminTelegramIds", { infer: true });

    return adminTelegramIds.includes(telegramUserId);
  }
}
