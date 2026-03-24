"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { BuyerCategoryCarousel } from "@/components/buyer-category-carousel";
import { BuyerProductCard } from "@/components/buyer-product-card";
import { BuyerScreen } from "@/components/buyer-screen";
import { preloadImages, readCatalogCache, writeCatalogCache } from "@/features/buyer/catalog-cache";
import { createCartItem } from "@/features/buyer/cart-item";
import { useCart } from "@/features/buyer/cart-context";
import type { CategoryDto, ProductDto } from "@/features/buyer/types";
import { apiGet } from "@/lib/client-api";

export default function CategoryPage() {
  const params = useParams<{ categorySlug: string }>();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    if (!params.categorySlug) {
      return;
    }

    const categoryCacheKey = "categories";
    const productsCacheKey = `catalog:category:${params.categorySlug}`;
    const cachedCategories = readCatalogCache<CategoryDto[]>(categoryCacheKey);
    const cachedProducts = readCatalogCache<ProductDto[]>(productsCacheKey);

    if (cachedCategories) {
      setCategories(cachedCategories);
      preloadImages(cachedCategories.map((category) => category.imageUrl));
    }

    if (cachedProducts) {
      setProducts(cachedProducts);
      preloadImages(cachedProducts.map((product) => product.imageUrl));
    }

    void Promise.all([
      apiGet<CategoryDto[]>("/catalog/categories"),
      apiGet<ProductDto[]>(`/catalog/products?category=${encodeURIComponent(params.categorySlug)}`)
    ]).then(([nextCategories, nextProducts]) => {
      setCategories(nextCategories);
      setProducts(nextProducts);
      writeCatalogCache(categoryCacheKey, nextCategories);
      writeCatalogCache(productsCacheKey, nextProducts);
      preloadImages(nextCategories.map((category) => category.imageUrl));
      preloadImages(nextProducts.map((product) => product.imageUrl));
    });
  }, [params.categorySlug]);

  const currentCategory = useMemo(
    () => categories.find((category) => category.slug === params.categorySlug) ?? null,
    [categories, params.categorySlug]
  );

  function handleAdd(product: ProductDto) {
    addItem(createCartItem(product));
    setAddedProductId(product.id);
    window.setTimeout(() => setAddedProductId((current) => (current === product.id ? null : current)), 1200);
  }

  return (
    <BuyerScreen headerMode="logo" subtitle="" title={currentCategory?.name ?? "Категория"}>
      <BuyerCategoryCarousel categories={categories} compact selectedSlug={params.categorySlug ?? null} />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-semibold text-[#111111]">{currentCategory?.name ?? "Категория"}</h2>
          <span className="text-sm text-[#728390]">{products.length}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <BuyerProductCard
              key={product.id}
              added={addedProductId === product.id}
              onAdd={handleAdd}
              product={product}
            />
          ))}
        </div>
      </section>
    </BuyerScreen>
  );
}
