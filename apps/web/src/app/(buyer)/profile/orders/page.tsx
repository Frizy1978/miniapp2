"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BuyerScreen } from "@/components/buyer-screen";
import { formatRub } from "@/features/buyer/format";
import type { OrderDto } from "@/features/buyer/types";
import { apiGet } from "@/lib/client-api";

export default function ProfileOrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);

  useEffect(() => {
    void apiGet<OrderDto[]>("/me/orders", true).then(setOrders).catch(() => null);
  }, []);

  return (
    <BuyerScreen backHref="/profile" headerMode="title" subtitle="" title="История заявок">
      <section className="rounded-[18px] bg-[#dff4fb] px-5 py-5">
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              className="flex items-center justify-between rounded-[14px] bg-white px-4 py-4 shadow-[0_10px_20px_rgba(90,125,156,0.08)]"
              href={`/profile/orders/${order.code}`}
            >
              <div>
                <p className="text-[15px] font-medium text-[#303030]">{order.code}</p>
                <p className="mt-1 text-sm text-[#6e7d89]">{new Date(order.createdAt).toLocaleString("ru-RU")}</p>
              </div>
              <p className="text-[17px] font-semibold text-[#0c959c]">{formatRub(order.subtotal, 2)}</p>
            </Link>
          ))}
          {orders.length === 0 ? <p className="text-sm text-[#6e7d89]">История пока пуста.</p> : null}
        </div>
      </section>
    </BuyerScreen>
  );
}
