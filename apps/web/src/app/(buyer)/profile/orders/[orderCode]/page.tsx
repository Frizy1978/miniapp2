"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { BuyerScreen } from "@/components/buyer-screen";
import { formatQuantity, formatRub } from "@/features/buyer/format";
import type { OrderDto } from "@/features/buyer/types";
import { apiGet } from "@/lib/client-api";

export default function ProfileOrderDetailsPage() {
  const params = useParams<{ orderCode: string }>();
  const [order, setOrder] = useState<OrderDto | null>(null);

  useEffect(() => {
    if (!params.orderCode) {
      return;
    }

    void apiGet<OrderDto>(`/me/orders/${params.orderCode}`, true).then(setOrder).catch(() => null);
  }, [params.orderCode]);

  return (
    <BuyerScreen backHref="/profile/orders" headerMode="title" subtitle="" title={order?.code ?? "Заявка"}>
      <section className="rounded-[18px] bg-[#dff4fb] px-5 py-5">
        <p className="text-sm text-[#687b8d]">{order ? `Batch ${order.batch.code}` : "Загрузка..."}</p>
        <div className="mt-4 space-y-3">
          {order?.items.map((item) => (
            <article key={item.id} className="flex items-center justify-between rounded-[14px] bg-white px-4 py-4 shadow-[0_10px_20px_rgba(90,125,156,0.08)]">
              <div>
                <p className="text-[15px] text-[#202020]">{item.productNameSnapshot}</p>
                <p className="mt-1 text-sm text-[#687b8d]">
                  {formatQuantity(item.quantity)} {item.unitLabelSnapshot ?? "ед."}
                </p>
              </div>
              <p className="text-[17px] font-semibold text-[#0c959c]">{formatRub(item.lineTotal, 2)}</p>
            </article>
          ))}
        </div>
      </section>

      {order ? (
        <section className="rounded-[18px] bg-white px-5 py-5 shadow-[0_10px_24px_rgba(90,125,156,0.08)]">
          <p className="text-sm text-[#687b8d]">Итого</p>
          <p className="mt-3 text-[24px] font-semibold text-[#202020]">{formatRub(order.subtotal, 2)}</p>
        </section>
      ) : null}
    </BuyerScreen>
  );
}
