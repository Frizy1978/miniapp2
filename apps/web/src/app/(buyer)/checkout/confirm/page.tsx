"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { BuyerScreen } from "@/components/buyer-screen";
import { useCart } from "@/features/buyer/cart-context";
import { formatQuantity, formatRub } from "@/features/buyer/format";
import type { BatchDto } from "@/features/buyer/types";
import { apiGet, apiPost } from "@/lib/client-api";

export default function CheckoutConfirmPage() {
  const router = useRouter();
  const { clearCart, items, total } = useCart();
  const [batch, setBatch] = useState<BatchDto>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = batch?.status === "open" && items.length > 0 && !submitting;

  useEffect(() => {
    void apiGet<BatchDto>("/batches/current").then(setBatch).catch(() => null);
  }, []);

  async function submitOrder() {
    setSubmitting(true);

    try {
      const result = await apiPost<{ action: "created" | "updated"; order: { code: string } }>(
        "/me/orders/current",
        {
          comment,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        },
        true
      );

      clearCart();
      router.push(`/checkout/success?orderCode=${result.order.code}&action=${result.action}`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Не удалось сохранить заказ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BuyerScreen backHref="/cart" headerMode="title" subtitle="" title="Подтверждение">
      <section className="rounded-[18px] bg-white px-5 py-5 shadow-[0_10px_24px_rgba(90,125,156,0.08)]">
        <p className="text-[17px] font-semibold text-[#202020]">Позиции заказа</p>
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between rounded-[14px] bg-[#eff6fd] px-4 py-3">
              <div>
                <p className="text-[15px] text-[#202020]">{item.name}</p>
                <p className="mt-1 text-sm text-[#687b8d]">
                  {formatQuantity(item.quantity)} {item.unitLabel ?? "ед."}
                </p>
              </div>
              <p className="text-[16px] font-semibold text-[#202020]">{formatRub(Number(item.price) * item.quantity, 2)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[18px] bg-white px-5 py-5 shadow-[0_10px_24px_rgba(90,125,156,0.08)]">
        <p className="text-[17px] font-semibold text-[#202020]">Комментарий</p>
        <textarea
          className="mt-4 min-h-28 w-full rounded-[14px] bg-[#f8fbfe] px-4 py-4 text-sm text-[#202020] outline-none"
          onChange={(event) => setComment(event.target.value)}
          placeholder="Например, если нужна пометка по выдаче"
          value={comment}
        />
      </section>

      <section className="rounded-[18px] bg-[#dff4fb] px-5 py-5">
        <p className="text-sm text-[#5f7487]">Поставка: {batch?.code ?? "нет активной поставки"}</p>
        <p className="mt-3 text-[22px] font-semibold text-[#202020]">{formatRub(total, 2)}</p>
      </section>

      <button
        className={`rounded-[14px] px-5 py-4 text-base text-white ${canSubmit ? "bg-[#0c959c]" : "bg-[#8bbec3]"}`}
        disabled={!canSubmit}
        onClick={() => void submitOrder()}
        type="button"
      >
        {submitting ? "Сохраняем..." : "Подтвердить заказ"}
      </button>
    </BuyerScreen>
  );
}
