import { createHmac, timingSafeEqual } from "node:crypto";

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { AppEnvironment } from "../../common/config/env";
import type { AuthenticatedUser } from "../../common/types/request-with-user";

type SessionPayload = {
  displayName: string;
  exp: number;
  firstName: string | null;
  iat: number;
  isDevSession: boolean;
  lastName: string | null;
  role: "buyer" | "admin";
  sub: string;
  telegramUserId: string;
  username: string | null;
  v: 1;
};

@Injectable()
export class AuthSessionService {
  constructor(private readonly configService: ConfigService<AppEnvironment, true>) {}

  createSession(user: AuthenticatedUser): string {
    const now = Math.floor(Date.now() / 1000);
    const ttlSeconds = this.configService.get("telegram.sessionTtlSeconds", { infer: true }) ?? 2_592_000;
    const payload: SessionPayload = {
      displayName: user.displayName,
      exp: now + ttlSeconds,
      firstName: user.firstName,
      iat: now,
      isDevSession: user.isDevSession,
      lastName: user.lastName,
      role: user.role,
      sub: user.id,
      telegramUserId: user.telegramUserId,
      username: user.username,
      v: 1
    };
    const encodedPayload = this.base64url(JSON.stringify(payload));
    const signature = this.sign(encodedPayload);

    return `${encodedPayload}.${signature}`;
  }

  verifySession(token: string): AuthenticatedUser {
    const [encodedPayload, signature] = token.split(".");

    if (!encodedPayload || !signature) {
      throw new UnauthorizedException("Malformed auth session token");
    }

    const expectedSignature = this.sign(encodedPayload);
    const actualSignatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (actualSignatureBuffer.length !== expectedSignatureBuffer.length) {
      throw new UnauthorizedException("Invalid auth session signature length");
    }

    const signaturesMatch = timingSafeEqual(actualSignatureBuffer, expectedSignatureBuffer);

    if (!signaturesMatch) {
      throw new UnauthorizedException("Invalid auth session signature");
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp < now) {
      throw new UnauthorizedException("Auth session token expired");
    }

    return {
      displayName: payload.displayName,
      firstName: payload.firstName,
      id: payload.sub,
      isDevSession: payload.isDevSession,
      lastName: payload.lastName,
      role: payload.role,
      telegramUserId: payload.telegramUserId,
      username: payload.username
    };
  }

  private base64url(value: string): string {
    return Buffer.from(value, "utf8").toString("base64url");
  }

  private sign(value: string): string {
    const secret = this.getSecret();

    return createHmac("sha256", secret).update(value).digest("base64url");
  }

  private getSecret(): string {
    const botToken = this.configService.get("telegram.botToken", { infer: true });

    if (!botToken) {
      throw new UnauthorizedException("Telegram bot token is required for auth session signing");
    }

    return createHmac("sha256", "fisholha-auth-session").update(botToken).digest("hex");
  }
}
