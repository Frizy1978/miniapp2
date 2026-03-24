"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BuyerScreen } from "@/components/buyer-screen";
import { formatRub } from "@/features/buyer/format";
import type { OrderDto } from "@/features/buyer/types";
import { apiGet } from "@/lib/client-api";

type CurrentUser = {
  displayName: string;
  firstName: string | null;
  isDevSession: boolean;
  lastName: string | null;
  role: "buyer" | "admin";
  telegramUserId: string;
  username: string | null;
} | null;

export default function ProfilePage() {
  const [user, setUser] = useState<CurrentUser>(null);
  const [orders, setOrders] = useState<OrderDto[]>([]);

  useEffect(() => {
    void apiGet<CurrentUser>("/auth/me", true).then(setUser).catch(() => null);
    void apiGet<OrderDto[]>("/me/orders", true).then(setOrders).catch(() => null);
  }, []);

  return (
    <BuyerScreen headerMode="title" subtitle="" title="Профиль">
      <section className="rounded-[18px] bg-[#edf6ff] px-5 py-5">
        <p className="text-[15px] text-[#1f1f1f]">Ваш Telegram</p>
        <p className="mt-3 text-[23px] font-semibold leading-8 text-[#1f1f1f]">{user?.displayName ?? "Нет сессии"}</p>
        <p className="mt-2 text-[15px] text-[#4f6173]">@{user?.username ?? "username"}</p>
      </section>

      <section className="rounded-[18px] bg-white px-5 py-5 shadow-[0_10px_24px_rgba(90,125,156,0.08)]">
        <h2 className="text-[17px] font-semibold text-[#1f1f1f]">Контакты</h2>
        <div className="mt-5 space-y-4 text-[16px] text-[#232323]">
          <div>
            <p className="text-sm text-[#6e7d89]">Имя</p>
            <p className="mt-1">{user?.firstName ?? user?.displayName ?? "Не указано"}</p>
          </div>
          <div>
            <p className="text-sm text-[#6e7d89]">Фамилия</p>
            <p className="mt-1">{user?.lastName ?? "Не указано"}</p>
          </div>
          <div>
            <p className="text-sm text-[#6e7d89]">Telegram ID</p>
            <p className="mt-1">{user?.telegramUserId ?? "Не указан"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[18px] bg-[#dff4fb] px-5 py-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[17px] font-semibold text-[#1f1f1f]">История заявок</h2>
          <Link className="text-sm font-medium text-[#2b86c7]" href="/profile/orders">
            Все
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {orders.slice(0, 2).map((order) => (
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
