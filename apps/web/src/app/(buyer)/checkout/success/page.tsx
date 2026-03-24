import Link from "next/link";

import { BuyerScreen } from "@/components/buyer-screen";

export default async function CheckoutSuccessPage({
  searchParams
}: {
  searchParams: Promise<{ action?: string; orderCode?: string }>;
}) {
  const { action, orderCode } = await searchParams;

  return (
    <BuyerScreen backHref="/catalog" headerMode="title" subtitle="" title="Готово">
      <section className="rounded-[18px] bg-white px-6 py-7 text-center shadow-[0_10px_24px_rgba(90,125,156,0.08)]">
        <p className="text-sm text-[#688095]">{action === "updated" ? "Заказ обновлен" : "Заказ сохранен"}</p>
        <p className="mt-4 text-[28px] font-semibold text-[#2a7fbe]">{orderCode ?? "Номер появится позже"}</p>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <Link className="rounded-[14px] bg-white px-4 py-4 text-center text-base text-[#202020] shadow-[0_10px_24px_rgba(90,125,156,0.08)]" href="/catalog">
          Каталог
        </Link>
        <Link className="rounded-[14px] bg-[#0c959c] px-4 py-4 text-center text-base text-white" href="/profile/orders">
          История
        </Link>
      </div>
    </BuyerScreen>
  );
}
