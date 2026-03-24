import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import type { AdminOrderDetails } from "@/features/admin/contracts";
import {
  formatAdminDate,
  formatAdminQuantity,
  formatAdminRub,
  getBatchStatusLabel,
  getOrderStatusLabel
} from "@/features/admin/format";
import { apiServerGet } from "@/lib/server-api";

function getBatchTone(status: AdminOrderDetails["batch"]["status"]) {
  if (status === "open" || status === "closed" || status === "archived") {
    return status;
  }

  return "draft";
}

function getOrderTone(status: AdminOrderDetails["status"]) {
  return status === "accepted" ? "accepted" : "draft";
}

export default async function AdminOrderDetailsPage({
  params
}: {
  params: Promise<{ orderCode: string }>;
}) {
  const { orderCode } = await params;
  const order = await apiServerGet<AdminOrderDetails>(`/admin/orders/${encodeURIComponent(orderCode)}`, true);

  return (
    <PageShell
      eyebrow="Phase 5"
      title={`Заказ ${order.code}`}
      description="Подробности buyer-заказа: покупатель, поставка и полный состав заказа со snapshot-данными товаров."
    >
      <div className="grid gap-4 md:grid-cols-4">
        <SectionCard title="Статус">
          <StatusPill tone={getOrderTone(order.status)} label={getOrderStatusLabel(order.status)} />
        </SectionCard>
        <SectionCard title="Поставка">
          <Link href={`/admin/batches/${order.batch.code}`} className="text-lg font-semibold text-brand-700">
            {order.batch.code}
          </Link>
          <div className="mt-2">
            <StatusPill tone={getBatchTone(order.batch.status)} label={getBatchStatusLabel(order.batch.status)} />
          </div>
        </SectionCard>
        <SectionCard title="Сумма">
          <p className="text-3xl font-semibold text-slate-900">{formatAdminRub(order.subtotal)}</p>
        </SectionCard>
        <SectionCard title="Подтвержден">
          <p className="text-sm font-medium text-slate-900">{formatAdminDate(order.confirmedAt ?? order.createdAt)}</p>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Покупатель">
          <div className="space-y-2 text-sm text-slate-700">
            <p>Имя: {order.buyer.displayName}</p>
            <p>Username: {order.buyer.username ? `@${order.buyer.username}` : "—"}</p>
            <p>Telegram ID: {order.buyer.telegramUserId ?? "—"}</p>
            <p>Локация: {order.buyer.locality ?? "—"}</p>
            <p>Комментарий к доставке: {order.buyer.deliveryNote ?? "—"}</p>
          </div>
        </SectionCard>

        <SectionCard title="Поставка">
          <div className="space-y-2 text-sm text-slate-700">
            <p>Код: {order.batch.code}</p>
            <p>Прием до: {formatAdminDate(order.batch.closesAt)}</p>
            <p>Доставка: {formatAdminDate(order.batch.deliveryAt)}</p>
            <p>Сообщение покупателю: {order.batch.customerMessage ?? "—"}</p>
          </div>
          {order.comment ? (
            <p className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-slate-700">{order.comment}</p>
          ) : null}
        </SectionCard>
      </div>

      <SectionCard title="Состав заказа" description="Snapshot-данные берутся из order items, поэтому история не ломается после синхронизации WooCommerce.">
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 rounded-[22px] border border-slate-200 p-4"
            >
              <div className="h-20 w-20 overflow-hidden rounded-[20px] bg-slate-100">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.productNameSnapshot} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-slate-900">{item.productNameSnapshot}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {formatAdminRub(item.priceSnapshot)} / {item.unitLabelSnapshot ?? "ед."}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Количество: {formatAdminQuantity(item.quantity)} {item.unitLabelSnapshot ?? ""}
                </p>
                <p className="mt-1 text-xs text-slate-500">SKU: {item.skuSnapshot ?? "—"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{formatAdminRub(item.lineTotal)}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </PageShell>
  );
}
