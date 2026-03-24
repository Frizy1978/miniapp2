import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";

import { PrismaModule } from "../../common/prisma/prisma.module";
import { AuthController } from "./auth.controller";
import { AuthSessionService } from "./auth-session.service";
import { AuthService } from "./auth.service";
import { AuthContextMiddleware } from "./dev-auth.middleware";
import { TelegramAuthService } from "./telegram-auth.service";

@Module({
  controllers: [AuthController],
  imports: [PrismaModule],
  providers: [AuthService, AuthSessionService, TelegramAuthService],
  exports: [AuthService, AuthSessionService, TelegramAuthService]
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AuthContextMiddleware).forRoutes("*");
  }
}
