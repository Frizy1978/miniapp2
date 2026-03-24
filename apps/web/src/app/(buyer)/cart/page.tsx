"use client";

import { useEffect, useState } from "react";

import { BuyerScreen } from "@/components/buyer-screen";
import { useCart } from "@/features/buyer/cart-context";
import { formatRub, formatUnitPrice } from "@/features/buyer/format";
import type { BatchDto } from "@/features/buyer/types";
import { apiGet } from "@/lib/client-api";

export default function CartPage() {
  const { items, removeItem, setQuantity, total } = useCart();
  const [batch, setBatch] = useState<BatchDto>(null);

  useEffect(() => {
    void apiGet<BatchDto>("/batches/current").then(setBatch).catch(() => null);
  }, []);

  const canCheckout = items.length > 0 && batch?.status === "open";

  return (
    <BuyerScreen headerMode="title" subtitle="" title="Корзина">
      <section className="space-y-4">
        {items.map((item) => (
          <article key={item.productId} className="rounded-[18px] bg-[#eff6fd] px-4 py-4 shadow-[0_10px_24px_rgba(90,125,156,0.1)]">
            <div className="flex gap-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[14px] bg-white">
                {item.imageUrl ? (
                  <img alt={item.name} className="h-full w-full object-cover" loading="lazy" src={item.imageUrl} />
                ) : (
                  <div className="flex h-full items-center justify-center text-3xl text-[#b8c7d3]">◌</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-[#7ca6bf]">{item.unitType === "weight" ? "Весовой товар" : "Позиция каталога"}</p>
                    <p className="line-clamp-2 text-[19px] leading-6 text-[#272727]">{item.name}</p>
                    <p className="mt-1 text-[15px] text-[#2b2b2b]">{formatUnitPrice(item.price, item.unitLabel)}</p>
                  </div>
                  <button className="text-base text-[#222222]" onClick={() => removeItem(item.productId)} type="button">
                    <img alt="Удалить" className="h-5 w-5" src="/assets/trash.svg" />
                  </button>
                </div>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <input
                    className="h-10 w-[74px] rounded-[6px] bg-white px-3 text-center text-base text-[#3a3a3a] outline-none"
                    onChange={(event) => setQuantity(item.productId, Number.parseFloat(event.target.value))}
                    step={item.unitType === "weight" ? "0.1" : "1"}
                    type="number"
                    value={item.quantity}
                  />
                  <p className="text-[19px] font-semibold text-[#111111]">{formatRub(Number(item.price) * item.quantity, 2)}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-[18px] bg-[#8de2a5] px-5 py-5 text-[#2d4f3a] shadow-[0_12px_24px_rgba(84,174,103,0.18)]">
        <p className="text-sm leading-6">
          Весовые позиции пересчитываются в процессе сборки заказа. Итоговая сумма может немного измениться.
        </p>
        <p className="mt-5 text-[18px] font-semibold text-[#22342a]">Итого (предварительно): {formatRub(total, 2)}</p>
      </section>

      <a
        className={`flex items-center justify-center rounded-[14px] px-5 py-4 text-base font-medium text-white shadow-[0_14px_28px_rgba(12,149,156,0.22)] ${
          canCheckout ? "bg-[#0c959c]" : "pointer-events-none bg-[#8bbec3]"
        }`}
        href="/checkout/confirm"
      >
        Подтвердить заказ
      </a>
    </BuyerScreen>
  );
}
