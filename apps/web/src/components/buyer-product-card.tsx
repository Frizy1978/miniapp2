"use client";

import Link from "next/link";

import { formatUnitPrice } from "@/features/buyer/format";
import type { ProductDto } from "@/features/buyer/types";

type BuyerProductCardProps = {
  added?: boolean;
  onAdd: (product: ProductDto) => void;
  product: ProductDto;
};

export function BuyerProductCard({ added = false, onAdd, product }: BuyerProductCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[16px] bg-white px-3 pb-3 pt-2 shadow-[0_10px_24px_rgba(90,125,156,0.1)]">
      <Link href={`/product/${encodeURIComponent(product.slug)}`} className="block">
        <div className="aspect-[0.94] overflow-hidden rounded-[12px] bg-[#f8fbfe]">
          {product.imageUrl ? (
            <img alt={product.name} className="h-full w-full object-cover" loading="lazy" src={product.imageUrl} />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl text-[#b7c6d3]">◌</div>
          )}
        </div>
      </Link>
      <div className="mt-2 flex flex-1 flex-col">
        <p className="text-[11px] text-[#5ea4c7]">{product.categories?.[0]?.name ?? "Новинка"}</p>
        <Link
          href={`/product/${encodeURIComponent(product.slug)}`}
          className="mt-1 line-clamp-1 block min-h-[20px] text-[15px] leading-5 text-[#262626]"
        >
          {product.name}
        </Link>
        <p className="mt-2 text-[15px] font-medium text-[#2b2b2b]">{formatUnitPrice(product.price, product.unitLabel)}</p>
        <div className="mt-auto pt-3">
          <button
            className={`flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm text-white ${
              added ? "bg-[#43b8c0]" : "bg-[#0c959c]"
            }`}
            onClick={() => onAdd(product)}
            type="button"
          >
            + В корзину
          </button>
        </div>
      </div>
    </article>
  );
}
