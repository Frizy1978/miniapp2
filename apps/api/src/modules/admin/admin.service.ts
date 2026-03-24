import { Injectable, NotFoundException } from "@nestjs/common";
import { BatchStatus, Prisma } from "@prisma/client";

import { PrismaService } from "../../common/prisma/prisma.service";
import { WooCommerceService } from "../integrations/woocommerce/woocommerce.service";

type ListOrdersOptions = {
  batchCode?: string;
  limit?: number;
};

type ProductSummaryAccumulator = {
  buyers: Set<string>;
  imageUrl: string | null;
  name: string;
  orders: Set<string>;
  productId: string | null;
  slug: string | null;
  totalQuantity: number;
  totalRevenue: number;
  unitLabel: string | null;
};

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wooCommerceService: WooCommerceService
  ) {}

  async getOverview() {
    const [batchCount, orderCount, productCount, activeProductCount, currentBatch, latestOrders, latestSync] =
      await Promise.all([
        this.prisma.orderBatch.count(),
        this.prisma.order.count(),
        this.prisma.productCache.count(),
        this.prisma.productCache.count({
          where: {
            isActive: true
          }
        }),
        this.prisma.orderBatch.findFirst({
          include: {
            _count: {
              select: {
                orders: true
              }
            }
          },
          orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
          where: {
            status: BatchStatus.open
          }
        }),
        this.prisma.order.findMany({
          include: {
            batch: {
              select: {
                code: true,
                status: true
              }
            },
            buyer: {
              select: {
                displayName: true,
                username: true
              }
            },
            items: {
              select: {
                id: true,
                quantity: true
              }
            }
          },
          orderBy: [{ confirmedAt: "desc" }, { createdAt: "desc" }],
          take: 5
        }),
        this.wooCommerceService.getSyncStatus()
      ]);

    const [buyersCount, revenueAggregate, currentBatchRevenue] = await Promise.all([
      this.prisma.order.groupBy({
        by: ["buyerId"]
      }),
      this.prisma.order.aggregate({
        _avg: {
          subtotal: true
        },
        _sum: {
          subtotal: true
        }
      }),
      currentBatch
        ? this.prisma.order.aggregate({
            _sum: {
              subtotal: true
            },
            where: {
              batchId: currentBatch.id
            }
          })
        : Promise.resolve({
            _sum: {
              subtotal: null
            }
          })
    ]);

    return {
      analytics: {
        averageCheck: revenueAggregate._avg.subtotal,
        buyersCount: buyersCount.length,
        revenueEstimate: revenueAggregate._sum.subtotal
      },
      batches: {
        current:
          currentBatch === null
            ? null
            : {
                closesAt: currentBatch.closesAt,
                code: currentBatch.code,
                customerMessage: currentBatch.customerMessage,
                deliveryAt: currentBatch.deliveryAt,
                ordersCount: currentBatch._count.orders,
                revenueEstimate: currentBatchRevenue._sum.subtotal,
                startsAt: currentBatch.startsAt,
                status: currentBatch.status
              },
        total: batchCount
      },
      catalog: {
        activeProducts: activeProductCount,
        products: productCount
      },
      foundation: false,
      orders: {
        latest: latestOrders.map((order) => ({
          batchCode: order.batch.code,
          buyerName: order.buyer.displayName,
          code: order.code,
          confirmedAt: order.confirmedAt,
          itemsCount: order.items.length,
          quantityTotal: order.items.reduce((sum, item) => sum + Number(item.quantity), 0),
          status: order.status,
          subtotal: order.subtotal,
          username: order.buyer.username
        })),
        total: orderCount
      },
      sync: latestSync
    };
  }

  async listOrders(options: ListOrdersOptions = {}) {
    const orders = await this.prisma.order.findMany({
      include: {
        batch: {
          select: {
            closesAt: true,
            code: true,
            deliveryAt: true,
            status: true
          }
        },
        buyer: {
          select: {
            deliveryNote: true,
            displayName: true,
            id: true,
            locality: true,
            telegramIdentity: {
              select: {
                telegramUserId: true
              }
            },
            username: true
          }
        },
        items: {
          select: {
            id: true,
            lineTotal: true,
            productNameSnapshot: true,
            quantity: true,
            unitLabelSnapshot: true
          }
        }
      },
      orderBy: [{ confirmedAt: "desc" }, { createdAt: "desc" }],
      take: options.limit,
      where: options.batchCode
        ? {
            batch: {
              code: options.batchCode
            }
          }
        : undefined
    });

    return orders.map((order) => ({
      batch: order.batch,
      buyer: {
        deliveryNote: order.buyer.deliveryNote,
        displayName: order.buyer.displayName,
        id: order.buyer.id,
        locality: order.buyer.locality,
        telegramUserId: order.buyer.telegramIdentity?.telegramUserId ?? null,
        username: order.buyer.username
      },
      code: order.code,
      comment: order.comment,
      confirmedAt: order.confirmedAt,
      createdAt: order.createdAt,
      items: order.items,
      itemsCount: order.items.length,
      quantityTotal: order.items.reduce((sum, item) => sum + Number(item.quantity), 0),
      status: order.status,
      subtotal: order.subtotal,
      updatedAt: order.updatedAt
    }));
  }

  async getOrderByCode(code: string) {
    const order = await this.prisma.order.findUnique({
      include: {
        batch: true,
        buyer: {
          select: {
            deliveryNote: true,
            displayName: true,
            firstName: true,
            lastName: true,
            locality: true,
            telegramIdentity: {
              select: {
                telegramUserId: true
              }
            },
            username: true
          }
        },
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
        code
      }
    });

    if (!order) {
      throw new NotFoundException(`Order with code "${code}" was not found`);
    }

    return {
      batch: order.batch,
      buyer: {
        deliveryNote: order.buyer.deliveryNote,
        displayName: order.buyer.displayName,
        firstName: order.buyer.firstName,
        lastName: order.buyer.lastName,
        locality: order.buyer.locality,
        telegramUserId: order.buyer.telegramIdentity?.telegramUserId ?? null,
        username: order.buyer.username
      },
      code: order.code,
      comment: order.comment,
      confirmedAt: order.confirmedAt,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        imageUrl: item.product?.imageUrl ?? null,
        lineTotal: item.lineTotal,
        priceSnapshot: item.priceSnapshot,
        productId: item.productId,
        productNameSnapshot: item.productNameSnapshot,
        productSlugSnapshot: item.productSlugSnapshot,
        quantity: item.quantity,
        skuSnapshot: item.skuSnapshot,
        unitLabelSnapshot: item.unitLabelSnapshot,
        unitTypeSnapshot: item.unitTypeSnapshot
      })),
      status: order.status,
      subtotal: order.subtotal,
      updatedAt: order.updatedAt
    };
  }

  async getBatchDetails(code: string) {
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
            telegramIdentity: {
              select: {
                telegramUserId: true
              }
            },
            username: true
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

    const [orders, products] = await Promise.all([
      this.listOrders({ batchCode: code }),
      this.getProductsSummary(code)
    ]);

    const subtotal = orders.reduce((sum, order) => sum + Number(order.subtotal), 0);
    const buyers = new Set(orders.map((order) => order.buyer.id));
    const quantityTotal = orders.reduce((sum, order) => sum + order.quantityTotal, 0);

    return {
      batch,
      orders,
      products: products.items,
      totals: {
        buyersCount: buyers.size,
        ordersCount: orders.length,
        quantityTotal,
        subtotal: this.toDecimalString(subtotal),
        uniqueProducts: products.items.length
      }
    };
  }

  async getProductsSummary(batchCode?: string) {
    const targetBatch = batchCode
      ? await this.prisma.orderBatch.findUnique({
          where: {
            code: batchCode
          }
        })
      : await this.prisma.orderBatch.findFirst({
          orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
          where: {
            status: BatchStatus.open
          }
        });

    if (!targetBatch) {
      return {
        batch: null,
        items: [],
        totals: {
          buyersCount: 0,
          ordersCount: 0,
          quantityTotal: "0.000",
          revenue: "0.00",
          uniqueProducts: 0
        }
      };
    }

    const orderItems = await this.prisma.orderItem.findMany({
      include: {
        order: {
          select: {
            buyerId: true,
            code: true
          }
        },
        product: {
          select: {
            imageUrl: true
          }
        }
      },
      where: {
        order: {
          batchId: targetBatch.id
        }
      }
    });

    const summaryMap = new Map<string, ProductSummaryAccumulator>();
    const orderCodes = new Set<string>();
    const buyerIds = new Set<string>();
    let totalQuantity = 0;
    let totalRevenue = 0;

    for (const item of orderItems) {
      const key = item.productId ?? item.productSlugSnapshot ?? item.productNameSnapshot;
      const existing = summaryMap.get(key) ?? {
        buyers: new Set<string>(),
        imageUrl: item.product?.imageUrl ?? null,
        name: item.productNameSnapshot,
        orders: new Set<string>(),
        productId: item.productId,
        slug: item.productSlugSnapshot,
        totalQuantity: 0,
        totalRevenue: 0,
        unitLabel: item.unitLabelSnapshot
      };

      existing.totalQuantity += Number(item.quantity);
      existing.totalRevenue += Number(item.lineTotal);
      existing.buyers.add(item.order.buyerId);
      existing.orders.add(item.order.code);

      if (!existing.imageUrl && item.product?.imageUrl) {
        existing.imageUrl = item.product.imageUrl;
      }

      summaryMap.set(key, existing);
      orderCodes.add(item.order.code);
      buyerIds.add(item.order.buyerId);
      totalQuantity += Number(item.quantity);
      totalRevenue += Number(item.lineTotal);
    }

    const items = Array.from(summaryMap.values())
      .map((item) => ({
        buyersCount: item.buyers.size,
        imageUrl: item.imageUrl,
        name: item.name,
        ordersCount: item.orders.size,
        productId: item.productId,
        slug: item.slug,
        totalQuantity: this.toQuantityString(item.totalQuantity),
        totalRevenue: this.toDecimalString(item.totalRevenue),
        unitLabel: item.unitLabel
      }))
      .sort((left, right) => Number(right.totalQuantity) - Number(left.totalQuantity));

    return {
      batch: targetBatch,
      items,
      totals: {
        buyersCount: buyerIds.size,
        ordersCount: orderCodes.size,
        quantityTotal: this.toQuantityString(totalQuantity),
        revenue: this.toDecimalString(totalRevenue),
        uniqueProducts: items.length
      }
    };
  }

  private toDecimalString(value: number) {
    return new Prisma.Decimal(value.toFixed(2)).toFixed(2);
  }

  private toQuantityString(value: number) {
    return new Prisma.Decimal(value.toFixed(3)).toFixed(3);
  }
}
