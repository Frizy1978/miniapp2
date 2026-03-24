import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import type { AdminBatchListItem, AdminOrderListItem } from "@/features/admin/contracts";
import {
  formatAdminDate,
  formatAdminQuantity,
  formatAdminRub,
  getOrderStatusLabel
} from "@/features/admin/format";
import { apiServerGet } from "@/lib/server-api";

function getOrderTone(status: AdminOrderListItem["status"]) {
  return status === "accepted" ? "accepted" : "draft";
}

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams: Promise<{ batch?: string }>;
}) {
  const { batch } = await searchParams;
  const query = batch ? `?batch=${encodeURIComponent(batch)}` : "";
  const [orders, batches] = await Promise.all([
    apiServerGet<AdminOrderListItem[]>(`/admin/orders${query}`, true),
    apiServerGet<AdminBatchListItem[]>("/admin/batches", true)
  ]);

  return (
    <PageShell
      eyebrow="Phase 5"
      title="Заказы"
      description="Общий список buyer-заказов с фильтрацией по поставке, суммам и составу."
    >
      <SectionCard title="Фильтр по поставке">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/orders"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              batch
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "bg-brand-700 text-white hover:bg-brand-600"
            }`}
          >
            Все поставки
          </Link>
          {batches.map((item) => (
            <Link
              key={item.code}
              href={`/admin/orders?batch=${encodeURIComponent(item.code)}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                batch === item.code
                  ? "bg-brand-700 text-white hover:bg-brand-600"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {item.code}
            </Link>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Список заказов" description="Каждая карточка ведет в детальный admin-view заказа.">
        <div className="space-y-3">
          {orders.length ? (
            orders.map((order) => (
              <Link
                key={order.code}
                href={`/admin/orders/${order.code}`}
                className="block rounded-[22px] border border-slate-200 p-4 transition hover:border-brand-300 hover:bg-brand-50/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-slate-900">{order.code}</p>
                      <StatusPill tone={getOrderTone(order.status)} label={getOrderStatusLabel(order.status)} />
                      <span className="text-xs text-slate-500">{order.batch.code}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {order.buyer.displayName}
                      {order.buyer.username ? ` • @${order.buyer.username}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{formatAdminDate(order.confirmedAt ?? order.createdAt)}</p>
                    {order.comment ? <p className="mt-3 text-sm text-slate-600">{order.comment}</p> : null}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatAdminRub(order.subtotal)}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {order.itemsCount} позиций • {formatAdminQuantity(order.quantityTotal)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Прием до {formatAdminDate(order.batch.closesAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {order.items.slice(0, 3).map((item) => (
                    <span
                      key={item.id}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                    >
                      {item.productNameSnapshot}
                    </span>
                  ))}
                  {order.items.length > 3 ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                      +{order.items.length - 3} еще
                    </span>
                  ) : null}
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-slate-600">Заказов по выбранному фильтру нет.</p>
          )}
        </div>
      </SectionCard>
    </PageShell>
  );
}
