import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import type { AdminOverview } from "@/features/admin/contracts";
import {
  formatAdminDate,
  formatAdminDateShort,
  formatAdminQuantity,
  formatAdminRub,
  getBatchStatusLabel,
  getOrderStatusLabel
} from "@/features/admin/format";
import { apiServerGet } from "@/lib/server-api";

function getBatchTone(
  status: NonNullable<AdminOverview["batches"]["current"]>["status"]
): "open" | "closed" | "draft" | "archived" {
  if (status === "open" || status === "closed" || status === "archived") {
    return status;
  }

  return "draft";
}

function getOrderTone(status: AdminOverview["orders"]["latest"][number]["status"]): "accepted" | "draft" {
  return status === "accepted" ? "accepted" : "draft";
}

export default async function AdminDashboardPage() {
  const overview = await apiServerGet<AdminOverview>("/admin/analytics/overview", true);

  return (
    <PageShell
      eyebrow="Phase 5"
      title="Админ-панель"
      description="Оперативная сводка по приемам заказов, каталогу и последним заказам. Эта зона уже использует реальные данные из PostgreSQL-кэша и buyer order flow."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SectionCard title="Текущая поставка">
          <p className="text-3xl font-semibold text-slate-900">
            {overview.batches.current ? overview.batches.current.code : "Нет"}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {overview.batches.current
              ? `Заказов: ${overview.batches.current.ordersCount}, доставка ${formatAdminDateShort(overview.batches.current.deliveryAt)}`
              : "Открытая поставка сейчас не создана."}
          </p>
        </SectionCard>
        <SectionCard title="Заказы">
          <p className="text-3xl font-semibold text-slate-900">{overview.orders.total}</p>
          <p className="mt-2 text-sm text-slate-600">
            Уникальных покупателей: {overview.analytics.buyersCount}
          </p>
        </SectionCard>
        <SectionCard title="Выручка">
          <p className="text-3xl font-semibold text-slate-900">
            {formatAdminRub(overview.analytics.revenueEstimate)}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Средний чек: {formatAdminRub(overview.analytics.averageCheck)}
          </p>
        </SectionCard>
        <SectionCard title="Каталог">
          <p className="text-3xl font-semibold text-slate-900">{overview.catalog.products}</p>
          <p className="mt-2 text-sm text-slate-600">
            Активных товаров: {overview.catalog.activeProducts}
          </p>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <SectionCard
          title="Последние заказы"
          description="Быстрый вход в свежие buyer-заказы без перехода в полную таблицу."
        >
          <div className="space-y-3">
            {overview.orders.latest.length ? (
              overview.orders.latest.map((order) => (
                <Link
                  key={order.code}
                  href={`/admin/orders/${order.code}`}
                  className="block rounded-[20px] border border-slate-200 px-4 py-3 transition hover:border-brand-300 hover:bg-brand-50/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{order.code}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {order.buyerName}
                        {order.username ? ` • @${order.username}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{formatAdminRub(order.subtotal)}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {order.itemsCount} позиций • {formatAdminQuantity(order.quantityTotal)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusPill tone={getOrderTone(order.status)} label={getOrderStatusLabel(order.status)} />
                    <span className="text-xs text-slate-500">{order.batchCode}</span>
                    <span className="text-xs text-slate-500">{formatAdminDate(order.confirmedAt)}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-600">Заказов пока нет.</p>
            )}
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Состояние sync">
            <div className="space-y-2 text-sm text-slate-600">
              <p>WooCommerce настроен: {overview.sync.configured ? "да" : "нет"}</p>
              <p>Последняя синхронизация: {formatAdminDate(overview.sync.lastSyncAt)}</p>
              <p>
                Последний запуск:{" "}
                {overview.sync.lastRun
                  ? `${overview.sync.lastRun.syncType} • ${overview.sync.lastRun.status}`
                  : "еще не запускался"}
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Текущая поставка">
            {overview.batches.current ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-slate-900">{overview.batches.current.code}</p>
                  <StatusPill
                    tone={getBatchTone(overview.batches.current.status)}
                    label={getBatchStatusLabel(overview.batches.current.status)}
                  />
                </div>
                <p className="text-sm text-slate-600">
                  Прием заказов до {formatAdminDate(overview.batches.current.closesAt)}
                </p>
                <p className="text-sm text-slate-600">
                  Доставка {formatAdminDate(overview.batches.current.deliveryAt)}
                </p>
                <p className="text-sm text-slate-600">
                  Оценка выручки: {formatAdminRub(overview.batches.current.revenueEstimate)}
                </p>
                <Link
                  href={`/admin/batches/${overview.batches.current.code}`}
                  className="inline-flex rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Открыть поставку
                </Link>
              </div>
            ) : (
              <p className="text-sm text-slate-600">Сейчас нет открытой поставки.</p>
            )}
          </SectionCard>
        </div>
      </div>
    </PageShell>
  );
}
