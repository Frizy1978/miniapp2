import { Controller, Get, Param, Query } from "@nestjs/common";

import { CatalogService } from "./catalog.service";

@Controller("catalog")
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get("categories")
  async listCategories() {
    return {
      data: await this.catalogService.listCategories(),
      ok: true
    };
  }

  @Get("products")
  async listProducts(
    @Query("search") search?: string,
    @Query("category") category?: string,
    @Query("featured") featured?: string,
    @Query("isNew") isNew?: string,
    @Query("limit") limit?: string
  ) {
    return {
      data: await this.catalogService.listProducts({
        category,
        featured,
        isNew,
        limit,
        search
      }),
      ok: true
    };
  }

  @Get("products/:slug")
  async getProduct(@Param("slug") slug: string) {
    return {
      data: await this.catalogService.getProduct(slug),
      ok: true
    };
  }
}
