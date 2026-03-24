import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../../common/prisma/prisma.service";

type ListProductsQuery = {
  category?: string;
  featured?: string;
  isNew?: string;
  limit?: string;
  search?: string;
};

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listCategories() {
    return this.prisma.categoryCache.findMany({
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        imageUrl: true,
        name: true,
        parentId: true,
        slug: true
      },
      where: {
        isActive: true
      }
    });
  }

  async listProducts(query: ListProductsQuery) {
    const normalizedCategory = query.category ? this.normalizeSlug(query.category) : undefined;
    const where: Prisma.ProductCacheWhereInput = {
      isActive: true
    };
    const limit = this.parseLimit(query.limit);
    const hasNewProducts =
      query.isNew === "true"
        ? await this.prisma.productCache.count({
            where: {
              isActive: true,
              isNew: true
            }
          })
        : 0;

    if (query.search) {
      where.name = {
        contains: query.search,
        mode: "insensitive"
      };
    }

    if (normalizedCategory) {
      where.categories = {
        some: {
          isActive: true,
          slug: normalizedCategory
        }
      };
    }

    if (query.featured === "true") {
      where.isFeatured = true;
    }

    if (query.isNew === "true" && hasNewProducts > 0) {
      where.isNew = true;
    }

    return this.prisma.productCache.findMany({
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy:
        query.isNew === "true" && hasNewProducts === 0
          ? [{ syncedAt: "desc" }, { updatedAt: "desc" }, { name: "asc" }]
          : [{ isFeatured: "desc" }, { isNew: "desc" }, { name: "asc" }],
      take: limit,
      where
    });
  }

  async getProduct(slug: string) {
    const normalizedSlug = this.normalizeSlug(slug);
    const product = await this.prisma.productCache.findFirst({
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      where: {
        OR: [{ slug }, { slug: normalizedSlug }]
      }
    });

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" was not found`);
    }

    return product;
  }

  private parseLimit(limit: string | undefined): number {
    const parsed = Number.parseInt(limit ?? "24", 10);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 24;
    }

    return Math.min(parsed, 100);
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
}
