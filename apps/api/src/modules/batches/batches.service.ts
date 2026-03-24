import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BatchStatus } from "@prisma/client";

import type { AuthenticatedUser } from "../../common/types/request-with-user";
import { UsersService } from "../users/users.service";
import { PrismaService } from "../../common/prisma/prisma.service";

type CreateBatchInput = {
  closesAt: string;
  customerMessage?: string;
  deliveryAt: string;
  openNow?: boolean;
  startsAt?: string;
};

@Injectable()
export class BatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService
  ) {}

  async getCurrentBatch() {
    const batch = await this.prisma.orderBatch.findFirst({
      orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
      where: {
        status: BatchStatus.open
      }
    });

    if (!batch) {
      return null;
    }

    return {
      closesAt: batch.closesAt?.toISOString() ?? null,
      code: batch.code,
      customerMessage: batch.customerMessage,
      deliveryAt: batch.deliveryAt?.toISOString() ?? null,
      id: batch.id,
      startsAt: batch.startsAt?.toISOString() ?? null,
      status: batch.status
    };
  }

  async listBatches() {
    return this.prisma.orderBatch.findMany({
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: [{ year: "desc" }, { sequence: "desc" }]
    });
  }

  async getBatchByCode(code: string) {
    const batch = await this.prisma.orderBatch.findUnique({
      include: {
        _count: {
          select: {
            orders: true
          }
        },
        createdBy: {
          select: {
            displayName: true,
            id: true,
            telegramIdentity: {
              select: {
                telegramUserId: true
              }
            }
          }
        }
      },
      where: {
        code
      }
    });

    if (!batch) {
      throw new NotFoundException(`Batch with code "${code}" was not found`);
    }

    return batch;
  }

  async createBatch(input: CreateBatchInput, currentUser: AuthenticatedUser) {
    const closesAt = new Date(input.closesAt);
    const deliveryAt = new Date(input.deliveryAt);
    const startsAt = input.startsAt ? new Date(input.startsAt) : new Date();

    if (Number.isNaN(closesAt.getTime()) || Number.isNaN(deliveryAt.getTime())) {
      throw new BadRequestException("Invalid closesAt or deliveryAt date");
    }

    if (closesAt <= startsAt) {
      throw new BadRequestException("Batch close time must be after start time");
    }

    const creator = await this.usersService.ensureUserFromAuthContext(currentUser);
    const year = startsAt.getUTCFullYear();
    const nextSequence = await this.getNextBatchSequence(year);
    const code = this.formatBatchCode(year, nextSequence);

    if (input.openNow) {
      await this.prisma.orderBatch.updateMany({
        data: {
          status: BatchStatus.closed
        },
        where: {
          status: BatchStatus.open
        }
      });
    }

    return this.prisma.orderBatch.create({
      data: {
        closesAt,
        code,
        createdById: creator.id,
        customerMessage: input.customerMessage?.trim() || null,
        deliveryAt,
        sequence: nextSequence,
        startsAt,
        status: input.openNow ? BatchStatus.open : BatchStatus.draft,
        year
      }
    });
  }

  async changeBatchStatus(code: string, status: BatchStatus) {
    const batch = await this.prisma.orderBatch.findUnique({
      where: {
        code
      }
    });

    if (!batch) {
      throw new NotFoundException(`Batch with code "${code}" was not found`);
    }

    if (status === BatchStatus.open) {
      await this.prisma.orderBatch.updateMany({
        data: {
          status: BatchStatus.closed
        },
        where: {
          code: {
            not: code
          },
          status: BatchStatus.open
        }
      });
    }

    return this.prisma.orderBatch.update({
      data: {
        status
      },
      where: {
        id: batch.id
      }
    });
  }

  async ensureOpenBatch() {
    const batch = await this.prisma.orderBatch.findFirst({
      orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
      where: {
        status: BatchStatus.open
      }
    });

    if (!batch) {
      throw new BadRequestException("No open order batch is available");
    }

    if (batch.closesAt && batch.closesAt <= new Date()) {
      await this.prisma.orderBatch.update({
        data: {
          status: BatchStatus.closed
        },
        where: {
          id: batch.id
        }
      });
      throw new BadRequestException("The current order batch is already closed");
    }

    return batch;
  }

  private async getNextBatchSequence(year: number) {
    const latestBatch = await this.prisma.orderBatch.findFirst({
      orderBy: {
        sequence: "desc"
      },
      where: {
        year
      }
    });

    return (latestBatch?.sequence ?? 0) + 1;
  }

  private formatBatchCode(year: number, sequence: number) {
    const yearShort = String(year).slice(-2);

    return `${yearShort}-${String(sequence).padStart(3, "0")}`;
  }
}
