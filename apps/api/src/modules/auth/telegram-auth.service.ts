import { createHmac, timingSafeEqual } from "node:crypto";

import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { AppEnvironment } from "../../common/config/env";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { AuthenticatedUser } from "../../common/types/request-with-user";

type TelegramMiniAppUser = {
  allows_write_to_pm?: boolean;
  first_name: string;
  id: number;
  is_bot?: boolean;
  language_code?: string;
  last_name?: string;
  photo_url?: string;
  username?: string;
};

type ValidatedMiniAppData = {
  authDate: number;
  queryId: string | null;
  raw: string;
  user: TelegramMiniAppUser;
};

@Injectable()
export class TelegramAuthService {
  constructor(
    private readonly configService: ConfigService<AppEnvironment, true>,
    private readonly prisma: PrismaService
  ) {}

  async authenticateMiniApp(initData: string): Promise<AuthenticatedUser> {
    const validatedData = this.validateInitData(initData);

    return this.upsertTelegramUser(validatedData);
  }

  validateInitData(initData: string): ValidatedMiniAppData {
    if (!initData) {
      throw new BadRequestException("Telegram initData is required");
    }

    const parsedData = new URLSearchParams(initData);
    const hash = parsedData.get("hash");

    if (!hash) {
      throw new UnauthorizedException("Telegram initData hash is missing");
    }

    const dataCheckString = Array.from(parsedData.entries())
      .filter(([key]) => key !== "hash" && key !== "signature")
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");
    const secret = createHmac("sha256", "WebAppData")
      .update(this.getBotToken())
      .digest();
    const expectedHash = createHmac("sha256", secret).update(dataCheckString).digest("hex");
    const hashBuffer = Buffer.from(hash);
    const expectedHashBuffer = Buffer.from(expectedHash);

    if (hashBuffer.length !== expectedHashBuffer.length) {
      throw new UnauthorizedException("Telegram initData hash length mismatch");
    }

    const hashesMatch = timingSafeEqual(hashBuffer, expectedHashBuffer);

    if (!hashesMatch) {
      throw new UnauthorizedException("Telegram initData validation failed");
    }

    const authDate = Number.parseInt(parsedData.get("auth_date") ?? "", 10);
    const maxAgeSeconds = this.configService.get("telegram.authMaxAgeSeconds", { infer: true }) ?? 86_400;
    const now = Math.floor(Date.now() / 1000);

    if (!Number.isFinite(authDate) || now - authDate > maxAgeSeconds) {
      throw new UnauthorizedException("Telegram initData is too old");
    }

    const userRaw = parsedData.get("user");

    if (!userRaw) {
      throw new UnauthorizedException("Telegram user payload is missing");
    }

    const user = JSON.parse(userRaw) as TelegramMiniAppUser;

    return {
      authDate,
      queryId: parsedData.get("query_id"),
      raw: initData,
      user
    };
  }

  private async upsertTelegramUser(data: ValidatedMiniAppData): Promise<AuthenticatedUser> {
    const telegramUserId = String(data.user.id);
    const role = this.isAdminTelegramId(telegramUserId) ? "admin" : "buyer";
    const displayName =
      [data.user.first_name, data.user.last_name, data.user.username]
        .map((value) => value?.trim())
        .filter(Boolean)
        .join(" ") || "Пользователь";

    const user = await this.prisma.$transaction(async (transaction) => {
      const existingIdentity = await transaction.telegramIdentity.findUnique({
        include: {
          user: true
        },
        where: {
          telegramUserId
        }
      });

      if (existingIdentity) {
        const updatedUser = await transaction.user.update({
          data: {
            displayName,
            firstName: data.user.first_name ?? null,
            lastName: data.user.last_name ?? null,
            role,
            username: data.user.username ?? null
          },
          where: {
            id: existingIdentity.userId
          }
        });

        await transaction.telegramIdentity.update({
          data: {
            firstName: data.user.first_name ?? null,
            lastAuthAt: new Date(data.authDate * 1000),
            lastName: data.user.last_name ?? null,
            username: data.user.username ?? null
          },
          where: {
            id: existingIdentity.id
          }
        });

        return updatedUser;
      }

      return transaction.user.create({
        data: {
          displayName,
          firstName: data.user.first_name ?? null,
          lastName: data.user.last_name ?? null,
          role,
          telegramIdentity: {
            create: {
              firstName: data.user.first_name ?? null,
              lastAuthAt: new Date(data.authDate * 1000),
              lastName: data.user.last_name ?? null,
              telegramUserId,
              username: data.user.username ?? null
            }
          },
          username: data.user.username ?? null
        }
      });
    });

    return {
      displayName: user.displayName,
      firstName: user.firstName,
      id: user.id,
      isDevSession: false,
      lastName: user.lastName,
      role: user.role,
      telegramUserId,
      username: user.username
    };
  }

  private getBotToken(): string {
    const botToken = this.configService.get("telegram.botToken", { infer: true });

    if (!botToken || botToken === "replace_me") {
      throw new UnauthorizedException("Telegram bot token is not configured");
    }

    return botToken;
  }

  private isAdminTelegramId(telegramUserId: string): boolean {
    const adminTelegramIds = this.configService.get("telegram.adminTelegramIds", { infer: true }) ?? [];

    return adminTelegramIds.includes(telegramUserId);
  }
}
