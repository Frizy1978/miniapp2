import { BadGatewayException, Injectable } from "@nestjs/common";
import { Prisma, SyncRunStatus, SyncType } from "@prisma/client";

import { PrismaService } from "../../../common/prisma/prisma.service";
import { WooCommerceClient } from "./woocommerce.client";
import type { WooMetaData, WooProduct, WooSyncScope, WooSyncStats } from "./woocommerce.types";

@Injectable()
export class WooCommerceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wooCommerceClient: WooCommerceClient
  ) {}

  async getSyncStatus() {
    const [latestRun, categoryCount, productCount, activeProductCount] = await Promise.all([
      this.prisma.syncRun.findFirst({
        orderBy: {
          startedAt: "desc"
        }
      }),
      this.prisma.categoryCache.count(),
      this.prisma.productCache.count(),
      this.prisma.productCache.count({
        where: {
          isActive: true
        }
      })
    ]);

    return {
      cache: {
        activeProducts: activeProductCount,
        categories: categoryCount,
        products: productCount
      },
      configuration: this.wooCommerceClient.getConfigurationSummary(),
      latestRun,
      supportedScopes: ["categories", "products", "full_catalog"] as const
    };
  }

  async syncCatalog(scope: WooSyncScope = "full_catalog") {
    if (!this.wooCommerceClient.isConfigured()) {
      throw new BadGatewayException("WooCommerce sync cannot start until credentials are configured");
    }

    const syncType = this.scopeToSyncType(scope);
    const run = await this.prisma.syncRun.create({
      data: {
        provider: "woocommerce",
        status: "running",
        syncType
      }
    });

    try {
      const stats: WooSyncStats = {
        categoriesProcessed: 0,
        productsProcessed: 0
      };

      if (scope === "categories" || scope === "full_catalog") {
        stats.categoriesProcessed = await this.syncCategories();
      }

      if (scope === "products" || scope === "full_catalog") {
        stats.productsProcessed = await this.syncProducts();
      }

      await this.prisma.syncRun.update({
        where: {
          id: run.id
        },
        data: {
          finishedAt: new Date(),
          statsJson: stats,
          status: SyncRunStatus.success
        }
      });

      return {
        runId: run.id,
        scope,
        stats
      };
    } catch (error) {
      await this.prisma.syncRun.update({
        where: {
          id: run.id
        },
        data: {
          errorText: error instanceof Error ? error.message : "Unknown sync error",
          finishedAt: new Date(),
          status: SyncRunStatus.failed
        }
      });

      throw error;
    }
  }

  private async syncCategories(): Promise<number> {
    const categories = await this.wooCommerceClient.fetchCategories();
    const externalIds = categories.map((category) => String(category.id));

    for (const category of categories) {
      await this.prisma.categoryCache.upsert({
        where: {
          externalId: String(category.id)
        },
        create: {
          externalId: String(category.id),
          imageUrl: category.image?.src ?? null,
          isActive: true,
          name: category.name,
          slug: this.normalizeSlug(category.slug)
        },
        update: {
          imageUrl: category.image?.src ?? null,
          isActive: true,
          name: category.name,
          slug: this.normalizeSlug(category.slug),
          syncedAt: new Date()
        }
      });
    }

    if (externalIds.length > 0) {
      await this.prisma.categoryCache.updateMany({
        where: {
          externalId: {
            notIn: externalIds
          }
        },
        data: {
          isActive: false,
          parentId: null
        }
      });
    } else {
      await this.prisma.categoryCache.updateMany({
        data: {
          isActive: false,
          parentId: null
        }
      });
    }

    const storedCategories = await this.prisma.categoryCache.findMany({
      select: {
        externalId: true,
        id: true
      }
    });
    const categoryIdByExternalId = new Map(storedCategories.map((category) => [category.externalId, category.id]));

    for (const category of categories) {
      await this.prisma.categoryCache.update({
        where: {
          externalId: String(category.id)
        },
        data: {
          parentId: category.parent > 0 ? (categoryIdByExternalId.get(String(category.parent)) ?? null) : null,
          syncedAt: new Date()
        }
      });
    }

    return categories.length;
  }

  private async syncProducts(): Promise<number> {
    const products = await this.wooCommerceClient.fetchProducts();
    const externalIds = products.map((product) => String(product.id));
    const categories = await this.prisma.categoryCache.findMany({
      select: {
        externalId: true,
        id: true
      }
    });
    const categoryIdByExternalId = new Map(categories.map((category) => [category.externalId, category.id]));

    for (const product of products) {
      const connectedCategoryIds = product.categories
        .map((category) => categoryIdByExternalId.get(String(category.id)))
        .filter((categoryId): categoryId is string => Boolean(categoryId));

      const productData = this.buildProductData(product);

      await this.prisma.productCache.upsert({
        where: {
          externalId: String(product.id)
        },
        create: {
          ...productData,
          externalId: String(product.id),
          categories: {
            connect: connectedCategoryIds.map((id) => ({ id }))
          }
        },
        update: {
          ...productData,
          categories: {
            set: connectedCategoryIds.map((id) => ({ id }))
          }
        }
      });
    }

    if (externalIds.length > 0) {
      await this.prisma.productCache.updateMany({
        where: {
          externalId: {
            notIn: externalIds
          }
        },
        data: {
          isActive: false
        }
      });
    } else {
      await this.prisma.productCache.updateMany({
        data: {
          isActive: false
        }
      });
    }

    return products.length;
  }

  private buildProductData(product: WooProduct): Omit<Prisma.ProductCacheCreateInput, "externalId" | "categories"> {
    const unitLabel = this.getMetaValue(product.meta_data, "_price_unit");
    const isNewFromMeta =
      this.asBoolean(this.getMetaValue(product.meta_data, "_is_new")) ??
      this.asBoolean(this.getMetaValue(product.meta_data, "is_new")) ??
      this.asBoolean(this.getMetaValue(product.meta_data, "new"));

    return {
      currency: "RUB",
      imageUrl: product.images[0]?.src ?? null,
      isActive: product.status !== "trash",
      isFeatured: Boolean(product.featured),
      isNew:
        isNewFromMeta ??
        (product.tags ?? []).some((tag) => ["new", "новинка", "новинки"].includes(tag.slug.toLowerCase())),
      name: product.name,
      price: new Prisma.Decimal(this.extractPrice(product)),
      rawMeta: {
        meta_data: product.meta_data as Prisma.InputJsonValue,
        stock_quantity: product.stock_quantity ?? null,
        stock_status: product.stock_status ?? null
      } as Prisma.InputJsonValue,
      sku: product.sku || null,
      slug: this.normalizeSlug(product.slug),
      syncedAt: new Date(),
      unitLabel,
      unitType: this.inferUnitType(unitLabel)
    };
  }

  private extractPrice(product: WooProduct): string {
    const rawPrice = product.price || product.sale_price || product.regular_price || "0";
    const numericPrice = Number.parseFloat(rawPrice);

    return Number.isFinite(numericPrice) ? numericPrice.toFixed(2) : "0.00";
  }

  private getMetaValue(metaData: WooMetaData[], key: string): string | null {
    const metaEntry = metaData.find((entry) => entry.key === key);

    if (!metaEntry) {
      return null;
    }

    if (typeof metaEntry.value === "string") {
      return metaEntry.value;
    }

    if (typeof metaEntry.value === "number") {
      return String(metaEntry.value);
    }

    return null;
  }

  private inferUnitType(unitLabel: string | null): "piece" | "weight" | "other" {
    if (!unitLabel) {
      return "other";
    }

    const normalized = unitLabel.toLowerCase();

    if (
      normalized.includes("кг") ||
      normalized.includes("kg") ||
      normalized.includes("г") ||
      normalized.includes("гр")
    ) {
      return "weight";
    }

    if (
      normalized.includes("шт") ||
      normalized.includes("piece") ||
      normalized.includes("упак") ||
      normalized.includes("бан")
    ) {
      return "piece";
    }

    return "other";
  }

  private asBoolean(value: string | null): boolean | null {
    if (!value) {
      return null;
    }

    const normalized = value.toLowerCase().trim();

    if (["1", "true", "yes"].includes(normalized)) {
      return true;
    }

    if (["0", "false", "no"].includes(normalized)) {
      return false;
    }

    return null;
  }

  private normalizeSlug(slug: string): string {
    if (!slug.includes("%")) {
      return slug;
    }

    try {
      return decodeURIComponent(slug);
    } catch {
      return slug;
    }
  }

  private scopeToSyncType(scope: WooSyncScope): SyncType {
    switch (scope) {
      case "categories":
        return SyncType.categories;
      case "products":
        return SyncType.products;
      default:
        return SyncType.full_catalog;
    }
  }
}
