import { BadGatewayException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { AppEnvironment } from "../../../common/config/env";
import type { WooCategory, WooProduct } from "./woocommerce.types";

@Injectable()
export class WooCommerceClient {
  constructor(private readonly configService: ConfigService<AppEnvironment, true>) {}

  isConfigured(): boolean {
    const baseUrl = this.configService.get("woocommerce.baseUrl", { infer: true });
    const consumerKey = this.configService.get("woocommerce.consumerKey", { infer: true });
    const consumerSecret = this.configService.get("woocommerce.consumerSecret", { infer: true });

    return (
      Boolean(baseUrl && consumerKey && consumerSecret) &&
      !["replace_me", "ck_replace_me", "cs_replace_me"].includes(consumerKey) &&
      !["replace_me", "ck_replace_me", "cs_replace_me"].includes(consumerSecret)
    );
  }

  getConfigurationSummary() {
    return {
      baseUrl: this.configService.get("woocommerce.baseUrl", { infer: true }),
      configured: this.isConfigured()
    };
  }

  async fetchCategories(): Promise<WooCategory[]> {
    return this.fetchAllPages<WooCategory>("products/categories");
  }

  async fetchProducts(): Promise<WooProduct[]> {
    return this.fetchAllPages<WooProduct>("products", {
      status: "publish"
    });
  }

  private async fetchAllPages<T>(path: string, extraParams: Record<string, string> = {}): Promise<T[]> {
    const baseUrl = this.configService.get("woocommerce.baseUrl", { infer: true });
    const consumerKey = this.configService.get("woocommerce.consumerKey", { infer: true });
    const consumerSecret = this.configService.get("woocommerce.consumerSecret", { infer: true });

    if (!baseUrl || !consumerKey || !consumerSecret) {
      throw new BadGatewayException("WooCommerce credentials are not configured");
    }

    const allItems: T[] = [];
    const perPage = 100;
    let page = 1;

    for (;;) {
      const url = new URL(`/wp-json/wc/v3/${path}`, baseUrl);
      url.searchParams.set("consumer_key", consumerKey);
      url.searchParams.set("consumer_secret", consumerSecret);
      url.searchParams.set("per_page", String(perPage));
      url.searchParams.set("page", String(page));

      for (const [key, value] of Object.entries(extraParams)) {
        url.searchParams.set(key, value);
      }

      const response = await fetch(url, {
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        const text = await response.text();
        throw new BadGatewayException(`WooCommerce request failed with ${response.status}: ${text}`);
      }

      const pageItems = (await response.json()) as T[];
      allItems.push(...pageItems);

      if (pageItems.length < perPage) {
        break;
      }

      page += 1;
    }

    return allItems;
  }
}
