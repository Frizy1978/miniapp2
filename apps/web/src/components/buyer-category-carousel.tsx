"use client";

import Link from "next/link";
import { useRef } from "react";

import type { CategoryDto } from "@/features/buyer/types";

type BuyerCategoryCarouselProps = {
  categories: CategoryDto[];
  compact?: boolean;
  selectedSlug?: string | null;
};

export function BuyerCategoryCarousel({ categories, compact = false, selectedSlug }: BuyerCategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  function scrollByOffset(offset: number) {
    scrollRef.current?.scrollBy({
      behavior: "smooth",
      left: offset
    });
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        {!compact ? (
          <div>
            <p className="text-sm font-semibold text-[#111111]">Категории</p>
            <p className="text-xs text-[#718393]">Выбери раздел каталога</p>
          </div>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <button
            aria-label="Прокрутить влево"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f7fb] text-[#5f7f97] shadow-[0_6px_16px_rgba(90,125,156,0.12)]"
            onClick={() => scrollByOffset(-180)}
            type="button"
          >
            ←
          </button>
          <button
            aria-label="Прокрутить вправо"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f7fb] text-[#5f7f97] shadow-[0_6px_16px_rgba(90,125,156,0.12)]"
            onClick={() => scrollByOffset(180)}
            type="button"
          >
            →
          </button>
        </div>
      </div>
      <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5">
        <div ref={scrollRef} className="flex min-w-max gap-4 overflow-x-auto scroll-smooth">
          {categories.map((category) => {
            const isSelected = selectedSlug === category.slug;

            return (
              <Link
                key={category.id}
                href={`/catalog/${encodeURIComponent(category.slug)}`}
                className={`w-[78px] shrink-0 text-center ${isSelected ? "text-[#1f7ec8]" : "text-[#2f2f2f]"}`}
              >
                <div className="mx-auto h-[62px] w-[62px] overflow-hidden">
                  {category.imageUrl ? (
                    <img alt={category.name} className="h-full w-full object-cover" loading="lazy" src={category.imageUrl} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#f6f9fc] text-[#b7c6d3]">◌</div>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-[12px] leading-4">{category.name}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
