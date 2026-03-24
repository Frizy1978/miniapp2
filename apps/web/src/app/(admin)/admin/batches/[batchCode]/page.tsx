import Link from "next/link";

import { AdminBatchActions } from "@/components/admin-batch-actions";
import { PageShell } from "@/components/page-shell";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import type { AdminBatchDetails } from "@/features/admin/contracts";
import {
  formatAdminDate,
  formatAdminQuantity,
  formatAdminRub,
  getBatchStatusLabel,
  getOrderStatusLabel
} from "@/features/admin/format";
import { apiServerGet } from "@/lib/server-api";

function getBatchTone(status: AdminBatchDetails["batch"]["status"]) {
  if (status === "open" || status === "closed" || status === "archived") {
    return status;
  }

  return "draft";
}

function getOrderTone(status: AdminBatchDetails["orders"][number]["status"]) {
  return status === "accepted" ? "accepted" : "draft";
}

export default async function AdminBatchDetailsPage({
  params
}: {
  params: Promise<{ batchCode: string }>;
}) {
  const { batchCode } = await params;
  const batch = await apiServerGet<AdminBatchDetails>(`/admin/batches/${encodeURIComponent(batchCode)}`, true);

  return (
    <PageShell
      eyebrow="Phase 5"
      title={`Поставка ${batch.batch.code}`}
      description="Детали выбранной поставки: окно приема, список buyer-заказов и агрегированная потребность по товарам."
    >
      <div className="grid gap-4 md:grid-cols-4">
        <SectionCard title="Заказы">
          <p className="text-3xl font-semibold text-slate-900">{batch.totals.ordersCount}</p>
        </SectionCard>
        <SectionCard title="Покупатели">
          <p className="text-3xl font-semibold text-slate-900">{batch.totals.buyersCount}</p>
        </SectionCard>
        <SectionCard title="Товаров">
          <p className="text-3xl font-semibold text-slate-900">{batch.totals.uniqueProducts}</p>
        </SectionCard>
        <SectionCard title="Сумма">
          <p className="text-3xl font-semibold text-slate-900">{formatAdminRub(batch.totals.subtotal)}</p>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <SectionCard title="Параметры поставки">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-slate-900">{batch.batch.code}</p>
                <p className="mt-1 text-sm text-slate-600">
                  Создано {formatAdminDate(batch.batch.createdAt)}
                </p>
              </div>
              <StatusPill tone={getBatchTone(batch.batch.status)} label={getBatchStatusLabel(batch.batch.status)} />
            </div>

            <div className="grid gap-3 text-sm text-slate-600">
              <p>Старт: {formatAdminDate(batch.batch.startsAt)}</p>
              <p>Прием до: {formatAdminDate(batch.batch.closesAt)}</p>
              <p>Доставка: {formatAdminDate(batch.batch.deliveryAt)}</p>
              <p>
                Создал: {batch.batch.createdBy?.displayName ?? "—"}
                {batch.batch.createdBy?.username ? ` • @${batch.batch.createdBy.username}` : ""}
              </p>
            </div>

            {batch.batch.customerMessage ? (
              <p className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-slate-700">{batch.batch.customerMessage}</p>
            ) : null}

            <AdminBatchActions code={batch.batch.code} status={batch.batch.status} />
          </div>
        </SectionCard>

        <SectionCard title="Сводка по товарам" description="Итоги по всем позициям внутри этой поставки.">
          <div className="space-y-3">
            {batch.products.length ? (
              batch.products.map((item) => (
                <div
                  key={`${item.productId ?? item.slug ?? item.name}`}
                  className="flex items-start gap-3 rounded-[20px] border border-slate-200 p-3"
                >
                  <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatAdminQuantity(item.totalQuantity)} {item.unitLabel ?? "ед."} • покупателей: {item.buyersCount}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatAdminRub(item.totalRevenue)}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.ordersCount} заказов</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">В этой поставке пока нет товаров.</p>
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Заказы в поставке" description="Buyer-centric список заказов с быстрым переходом в карточку.">
        <div className="space-y-3">
          {batch.orders.length ? (
            batch.orders.map((order) => (
              <Link
                key={order.code}
                href={`/admin/orders/${order.code}`}
                className="block rounded-[22px] border border-slate-200 p-4 transition hover:border-brand-300 hover:bg-brand-50/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-slate-900">{order.code}</p>
                      <StatusPill tone={getOrderTone(order.status)} label={getOrderStatusLabel(order.status)} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {order.buyer.displayName}
                      {order.buyer.username ? ` • @${order.buyer.username}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {order.buyer.locality ?? "Локация не указана"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatAdminRub(order.subtotal)}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {order.itemsCount} позиций • {formatAdminQuantity(order.quantityTotal)}
                    </p>
                  </div>
                </div>
                {order.comment ? <p className="mt-3 text-sm text-slate-600">{order.comment}</p> : null}
              </Link>
            ))
          ) : (
            <p className="text-sm text-slate-600">Заказов по этой поставке пока нет.</p>
          )}
        </div>
      </SectionCard>
    </PageShell>
  );
}
