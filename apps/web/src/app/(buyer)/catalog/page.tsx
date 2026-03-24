"use client";

import { useDeferredValue, useEffect, useState } from "react";

import { BuyerCategoryCarousel } from "@/components/buyer-category-carousel";
import { BuyerProductSlider } from "@/components/buyer-product-slider";
import { BuyerScreen } from "@/components/buyer-screen";
import { preloadImages, readCatalogCache, writeCatalogCache } from "@/features/buyer/catalog-cache";
import { createCartItem } from "@/features/buyer/cart-item";
import { useCart } from "@/features/buyer/cart-context";
import type { CategoryDto, ProductDto } from "@/features/buyer/types";
import { apiGet } from "@/lib/client-api";

export default function CatalogPage() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [search, setSearch] = useState("");
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const { addItem } = useCart();

  useEffect(() => {
    const cachedCategories = readCatalogCache<CategoryDto[]>("categories");

    if (cachedCategories) {
      setCategories(cachedCategories);
      preloadImages(cachedCategories.map((category) => category.imageUrl));
    }

    void apiGet<CategoryDto[]>("/catalog/categories")
      .then((nextCategories) => {
        setCategories(nextCategories);
        writeCatalogCache("categories", nextCategories);
        preloadImages(nextCategories.map((category) => category.imageUrl));
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({
      isNew: "true",
      limit: "8"
    });
    const cacheKey = deferredSearch.trim() ? `catalog:new:${deferredSearch.trim()}` : "catalog:new:default";

    if (deferredSearch.trim()) {
      params.set("search", deferredSearch.trim());
    }

    const cachedProducts = readCatalogCache<ProductDto[]>(cacheKey);

    if (cachedProducts) {
      setProducts(cachedProducts);
      preloadImages(cachedProducts.map((product) => product.imageUrl));
    }

    void apiGet<ProductDto[]>(`/catalog/products?${params.toString()}`)
      .then((nextProducts) => {
        setProducts(nextProducts);
        writeCatalogCache(cacheKey, nextProducts);
        preloadImages(nextProducts.map((product) => product.imageUrl));
      })
      .catch(() => null);
  }, [deferredSearch]);

  function handleAdd(product: ProductDto) {
    addItem(createCartItem(product));
    setAddedProductId(product.id);
    window.setTimeout(() => setAddedProductId((current) => (current === product.id ? null : current)), 1200);
  }

  return (
    <BuyerScreen headerMode="logo" subtitle="" title="Каталог">
      <section className="rounded-[20px] bg-white px-4 py-4">
        <div className="flex items-center gap-3 rounded-[14px] bg-white px-4 py-3 text-sm text-[#7d8c98] shadow-[0_10px_24px_rgba(90,125,156,0.14)]">
          <span className="text-base text-[#8ea2b4]">⌕</span>
          <input
            className="w-full bg-transparent outline-none"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Найти товар"
            value={search}
          />
        </div>
      </section>

      <BuyerCategoryCarousel categories={categories} compact />

      <section className="space-y-3">
        <h2 className="text-[22px] font-semibold text-[#111111]">Новинки</h2>
        <BuyerProductSlider addedProductId={addedProductId} onAdd={handleAdd} products={products} />
      </section>
    </BuyerScreen>
  );
}
