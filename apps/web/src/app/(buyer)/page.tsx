"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BuyerScreen } from "@/components/buyer-screen";
import type { BatchDto } from "@/features/buyer/types";
import { apiGet } from "@/lib/client-api";

function formatDateLabel(value: string | null) {
  if (!value) {
    return "Скоро сообщим дату выдачи";
  }

  return new Date(value).toLocaleString("ru-RU", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "long",
    year: "numeric"
  });
}

export default function BuyerHomePage() {
  const [batch, setBatch] = useState<BatchDto>(null);

  useEffect(() => {
    void apiGet<BatchDto>("/batches/current").then(setBatch).catch(() => null);
  }, []);

  return (
    <BuyerScreen
      headerMode="home"
      showBottomNav={false}
      title="МАГАЗИН РЫБЫ И МОРЕПРОДУКТОВ FISH OLHA"
    >
      <div className="-mx-4 -mt-4 px-4 pb-8 sm:-mx-5 sm:px-5">
        <section
          className="overflow-hidden rounded-[30px] bg-[#e4f0fb] px-4 pb-8 pt-2 shadow-[0_20px_48px_rgba(77,125,164,0.14)]"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(234,244,255,0.88) 0%, rgba(226,239,252,0.84) 100%), url('/assets/bg_im.png')",
            backgroundPosition: "center 200px",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain"
          }}
        >
          <section className="rounded-[28px] bg-white/72 px-5 py-5 shadow-[0_18px_40px_rgba(77,125,164,0.12)] backdrop-blur-[2px]">
            <p className="text-center text-lg font-semibold text-[#3f4c5e]">Открыт прием заказов</p>
            <div className="mt-4 space-y-3 text-sm text-[#5f7287]">
              <div className="flex items-start gap-3">
                <img alt="" className="mt-0.5 h-5 w-5" src="/assets/clock.svg" />
                <span>{batch?.closesAt ? `До ${formatDateLabel(batch.closesAt)}` : "Дата закрытия приема уточняется"}</span>
              </div>
              <div className="flex items-start gap-3">
                <img alt="" className="mt-0.5 h-5 w-5" src="/assets/wallet.svg" />
                <span>Оплата заказов при получении</span>
              </div>
            </div>
          </section>

          <div className="h-[290px]" />

          <section className="rounded-[28px] bg-white/74 px-5 py-5 shadow-[0_18px_40px_rgba(77,125,164,0.12)] backdrop-blur-[2px]">
            <p className="text-[17px] font-semibold text-[#3f4c5e]">Оформите заявку заранее.</p>
            <p className="mt-3 text-sm leading-6 text-[#627489]">
              Финальную сумму уточним после сбора заказа и взвешивания.
            </p>
            <div className="mt-4">
              <p className="text-base font-semibold text-[#3f4c5e]">Доставка:</p>
              <div className="mt-3 flex items-start gap-3 text-sm text-[#5f7287]">
                <img alt="" className="mt-0.5 h-5 w-5" src="/assets/dostavka.svg" />
                <span>{batch?.deliveryAt ? formatDateLabel(batch.deliveryAt) : "Дата и интервал выдачи уточняются"}</span>
              </div>
            </div>
          </section>

          <Link
            className="mx-auto mt-8 flex w-full items-center justify-center rounded-[14px] bg-[#1978bd] px-5 py-4 text-base font-medium text-white shadow-[0_16px_30px_rgba(25,120,189,0.24)]"
            href="/catalog"
          >
            Открыть каталог
          </Link>
        </section>
      </div>
    </BuyerScreen>
  );
}
