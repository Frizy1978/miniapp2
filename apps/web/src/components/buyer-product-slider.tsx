"use client";

import { BuyerProductCard } from "./buyer-product-card";

import type { ProductDto } from "@/features/buyer/types";

type BuyerProductSliderProps = {
  addedProductId?: string | null;
  onAdd: (product: ProductDto) => void;
  products: ProductDto[];
};

function chunkProducts(products: ProductDto[], chunkSize: number) {
  const chunks: ProductDto[][] = [];

  for (let index = 0; index < products.length; index += chunkSize) {
    chunks.push(products.slice(index, index + chunkSize));
  }

  return chunks;
}

export function BuyerProductSlider({ addedProductId, onAdd, products }: BuyerProductSliderProps) {
  const slides = chunkProducts(products, 4);

  if (!slides.length) {
    return null;
  }

  return (
    <section>
      <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5">
        <div className="flex snap-x snap-mandatory gap-4">
          {slides.map((slide, slideIndex) => (
            <div key={slideIndex} className="grid min-w-full snap-center grid-cols-2 gap-4">
              {slide.map((product) => (
                <BuyerProductCard
                  key={product.id}
                  added={addedProductId === product.id}
                  onAdd={onAdd}
                  product={product}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
