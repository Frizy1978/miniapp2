import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../common/prisma/prisma.service";
import type { AuthenticatedUser } from "../../common/types/request-with-user";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureUserFromAuthContext(user: AuthenticatedUser) {
    const existingIdentity = await this.prisma.telegramIdentity.findUnique({
      include: {
        user: true
      },
      where: {
        telegramUserId: user.telegramUserId
      }
    });

    if (existingIdentity) {
      return this.prisma.user.update({
        data: {
          displayName: user.displayName,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          username: user.username
        },
        where: {
          id: existingIdentity.userId
        }
      });
    }

    return this.prisma.user.create({
      data: {
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        telegramIdentity: {
          create: {
            firstName: user.firstName,
            lastAuthAt: new Date(),
            lastName: user.lastName,
            telegramUserId: user.telegramUserId,
            username: user.username
          }
        },
        username: user.username
      }
    });
  }
}
