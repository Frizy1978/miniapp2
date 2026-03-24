import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus() {
    let database: "up" | "down" = "up";

    try {
      await this.prisma.$queryRawUnsafe("SELECT 1");
    } catch {
      database = "down";
    }

    return {
      api: "up" as const,
      database,
      phase: "foundation",
      timestamp: new Date().toISOString()
    };
  }
}
