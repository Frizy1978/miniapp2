"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { BuyerScreen } from "@/components/buyer-screen";
import { createCartItem, getDefaultQuantity } from "@/features/buyer/cart-item";
import { useCart } from "@/features/buyer/cart-context";
import { formatRub, formatUnitPrice } from "@/features/buyer/format";
import type { ProductDto } from "@/features/buyer/types";
import { apiGet } from "@/lib/client-api";

export default function ProductPage() {
  const params = useParams<{ productSlug: string }>();
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    if (!params.productSlug) {
      return;
    }

    void apiGet<ProductDto>(`/catalog/products/${encodeURIComponent(params.productSlug)}`).then((nextProduct) => {
      setProduct(nextProduct);
      setQuantity(String(getDefaultQuantity(nextProduct.unitType)));
    });
  }, [params.productSlug]);

  function handleAddToCart() {
    if (!product) {
      return;
    }

    const parsedQuantity = Number.parseFloat(quantity);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return;
    }

    addItem(createCartItem(product, parsedQuantity));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <BuyerScreen backHref="__back__" headerMode="logo" subtitle="" title={product?.name ?? "Товар"}>
      <section className="overflow-hidden rounded-[18px] bg-white shadow-[0_12px_24px_rgba(90,125,156,0.1)]">
        <div className="aspect-square bg-[#f6f9fc]">
          {product?.imageUrl ? (
            <img alt={product.name} className="h-full w-full object-cover" src={product.imageUrl} />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl text-[#b8c7d3]">◌</div>
          )}
        </div>
        <div className="space-y-4 px-5 py-5">
          <div className="flex flex-wrap gap-2">
            {product?.categories?.map((category) => (
              <Link
                key={category.id}
                className="rounded-full bg-[#edf6ff] px-3 py-1 text-xs text-[#4c86a7]"
                href={`/catalog/${encodeURIComponent(category.slug)}`}
              >
                {category.name}
              </Link>
            ))}
          </div>
          <div>
            <p className="text-[24px] font-semibold leading-8 text-[#202020]">{product?.name ?? "Загрузка..."}</p>
            <p className="mt-2 text-[16px] text-[#303030]">{product ? formatUnitPrice(product.price, product.unitLabel) : "..."}</p>
          </div>
          <div className="rounded-[16px] bg-[#eff6fd] px-4 py-4">
            <p className="text-sm text-[#63798d]">Количество, {product?.unitLabel ?? "ед."}</p>
            <div className="mt-3 flex items-center gap-3">
              <input
                className="h-11 w-24 rounded-[8px] bg-white px-3 text-center text-base text-[#202020] outline-none"
                onChange={(event) => setQuantity(event.target.value)}
                step={product?.unitType === "weight" ? "0.1" : "1"}
                type="number"
                value={quantity}
              />
              <span className="text-sm text-[#63798d]">{product?.unitLabel ?? "ед."}</span>
            </div>
            <p className="mt-3 text-sm text-[#63798d]">
              Сумма: {product ? formatRub(Number(product.price) * Number.parseFloat(quantity || "0"), 2) : "0 руб."}
            </p>
          </div>
          <button
            className={`flex w-full items-center justify-center rounded-[14px] px-5 py-4 text-base text-white ${
              added ? "bg-[#43b8c0]" : "bg-[#0c959c]"
            }`}
            disabled={!product}
            onClick={handleAddToCart}
            type="button"
          >
            {added ? "Добавлено в корзину" : "В корзину"}
          </button>
        </div>
      </section>
    </BuyerScreen>
  );
}
