import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import type { AuthenticatedUser } from "../../common/types/request-with-user";
import { PrismaService } from "../../common/prisma/prisma.service";
import { BatchesService } from "../batches/batches.service";
import { UsersService } from "../users/users.service";

type UpsertOrderInput = {
  comment?: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly batchesService: BatchesService
  ) {}

  async listMyOrders(currentUser: AuthenticatedUser) {
    const buyer = await this.usersService.ensureUserFromAuthContext(currentUser);

    return this.prisma.order.findMany({
      include: {
        batch: true,
        items: {
          include: {
            product: {
              select: {
                imageUrl: true
              }
            }
          }
        }
      },
      orderBy: [{ createdAt: "desc" }],
      where: {
        buyerId: buyer.id
      }
    });
  }

  async getMyOrder(code: string, currentUser: AuthenticatedUser) {
    const buyer = await this.usersService.ensureUserFromAuthContext(currentUser);
    const order = await this.prisma.order.findFirst({
      include: {
        batch: true,
        items: {
          include: {
            product: {
              select: {
                imageUrl: true
              }
            }
          }
        }
      },
      where: {
        buyerId: buyer.id,
        code
      }
    });

    if (!order) {
      throw new NotFoundException(`Order with code "${code}" was not found`);
    }

    return order;
  }

  async getCurrentOrder(currentUser: AuthenticatedUser) {
    const buyer = await this.usersService.ensureUserFromAuthContext(currentUser);
    const batch = await this.prisma.orderBatch.findFirst({
      orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
      where: {
        status: "open"
      }
    });

    if (!batch) {
      return null;
    }

    return this.prisma.order.findFirst({
      include: {
        batch: true,
        items: {
          include: {
            product: {
              select: {
                imageUrl: true
              }
            }
          }
        }
      },
      where: {
        batchId: batch.id,
        buyerId: buyer.id
      }
    });
  }

  async upsertCurrentOrder(currentUser: AuthenticatedUser, input: UpsertOrderInput) {
    if (!input.items.length) {
      throw new BadRequestException("Order must contain at least one item");
    }

    const batch = await this.batchesService.ensureOpenBatch();
    const buyer = await this.usersService.ensureUserFromAuthContext(currentUser);
    const normalizedItems = this.normalizeItems(input.items);
    const products = await this.prisma.productCache.findMany({
      where: {
        id: {
          in: normalizedItems.map((item) => item.productId)
        },
        isActive: true
      }
    });
    const productMap = new Map(products.map((product) => [product.id, product]));

    if (productMap.size !== normalizedItems.length) {
      throw new BadRequestException("Some cart items are missing or inactive");
    }

    const existingOrder = await this.prisma.order.findFirst({
      where: {
        batchId: batch.id,
        buyerId: buyer.id
      }
    });

    const subtotal = normalizedItems.reduce((sum, item) => {
      const product = productMap.get(item.productId);

      return sum.plus(product!.price.mul(item.quantity));
    }, new Prisma.Decimal(0));

    const order = await this.prisma.$transaction(async (transaction) => {
      const orderRecord =
        existingOrder ??
        (await transaction.order.create({
          data: {
            batchId: batch.id,
            buyerId: buyer.id,
            code: await this.generateNextOrderCode(batch.id, batch.code, transaction),
            comment: input.comment?.trim() || null,
            confirmedAt: new Date(),
            status: "created",
            subtotal
          }
        }));

      if (existingOrder) {
        await transaction.order.update({
          data: {
            comment: input.comment?.trim() || null,
            confirmedAt: new Date(),
            subtotal
          },
          where: {
            id: orderRecord.id
          }
        });
      }

      await transaction.orderItem.deleteMany({
        where: {
          orderId: orderRecord.id
        }
      });

      for (const item of normalizedItems) {
        const product = productMap.get(item.productId)!;
        const quantity = new Prisma.Decimal(item.quantity);

        await transaction.orderItem.create({
          data: {
            lineTotal: product.price.mul(quantity),
            orderId: orderRecord.id,
            priceSnapshot: product.price,
            productId: product.id,
            productNameSnapshot: product.name,
            productSlugSnapshot: product.slug,
            quantity,
            skuSnapshot: product.sku,
            unitLabelSnapshot: product.unitLabel,
            unitTypeSnapshot: product.unitType
          }
        });
      }

      return transaction.order.findUniqueOrThrow({
        include: {
          batch: true,
          items: {
            include: {
              product: {
                select: {
                  imageUrl: true
                }
              }
            }
          }
        },
        where: {
          id: orderRecord.id
        }
      });
    });

    return {
      action: existingOrder ? "updated" : "created",
      order
    };
  }

  private normalizeItems(items: UpsertOrderInput["items"]) {
    const merged = new Map<string, number>();

    for (const item of items) {
      if (!item.productId) {
        continue;
      }

      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        throw new BadRequestException("Item quantity must be a positive number");
      }

      merged.set(item.productId, (merged.get(item.productId) ?? 0) + item.quantity);
    }

    return Array.from(merged.entries()).map(([productId, quantity]) => ({
      productId,
      quantity: Number.parseFloat(quantity.toFixed(3))
    }));
  }

  private async generateNextOrderCode(
    batchId: string,
    batchCode: string,
    transaction: Prisma.TransactionClient
  ) {
    const count = await transaction.order.count({
      where: {
        batchId
      }
    });

    return `${batchCode}-${String(count + 1).padStart(4, "0")}`;
  }
}
