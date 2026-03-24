import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { SectionCard } from "@/components/section-card";
import type { AdminBatchListItem, AdminProductsSummary } from "@/features/admin/contracts";
import { formatAdminDate, formatAdminQuantity, formatAdminRub } from "@/features/admin/format";
import { apiServerGet } from "@/lib/server-api";

export default async function AdminProductsSummaryPage({
  searchParams
}: {
  searchParams: Promise<{ batch?: string }>;
}) {
  const { batch } = await searchParams;
  const query = batch ? `?batch=${encodeURIComponent(batch)}` : "";
  const [summary, batches] = await Promise.all([
    apiServerGet<AdminProductsSummary>(`/admin/products-summary${query}`, true),
    apiServerGet<AdminBatchListItem[]>("/admin/batches", true)
  ]);

  return (
    <PageShell
      eyebrow="Phase 5"
      title="Сводка по товарам"
      description="Агрегированная потребность по товарам внутри выбранной поставки. Это основа для будущих admin export и закупочного контура."
    >
      <SectionCard title="Фильтр по поставке">
        <div className="flex flex-wrap gap-2">
          {batches.map((item) => (
            <Link
              key={item.code}
              href={`/admin/products-summary?batch=${encodeURIComponent(item.code)}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                (batch ?? summary.batch?.code) === item.code
                  ? "bg-brand-700 text-white hover:bg-brand-600"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {item.code}
            </Link>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-4">
        <SectionCard title="Поставка">
          <p className="text-3xl font-semibold text-slate-900">{summary.batch?.code ?? "—"}</p>
          <p className="mt-2 text-sm text-slate-600">{formatAdminDate(summary.batch?.deliveryAt ?? null)}</p>
        </SectionCard>
        <SectionCard title="Покупатели">
          <p className="text-3xl font-semibold text-slate-900">{summary.totals.buyersCount}</p>
        </SectionCard>
        <SectionCard title="Товаров">
          <p className="text-3xl font-semibold text-slate-900">{summary.totals.uniqueProducts}</p>
        </SectionCard>
        <SectionCard title="Сумма">
          <p className="text-3xl font-semibold text-slate-900">{formatAdminRub(summary.totals.revenue)}</p>
        </SectionCard>
      </div>

      <SectionCard title="Позиции" description="Отсортировано по общему количеству внутри поставки.">
        <div className="space-y-3">
          {summary.items.length ? (
            summary.items.map((item) => (
              <div
                key={`${item.productId ?? item.slug ?? item.name}`}
                className="flex items-start gap-4 rounded-[22px] border border-slate-200 p-4"
              >
                <div className="h-20 w-20 overflow-hidden rounded-[20px] bg-slate-100">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-slate-900">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatAdminQuantity(item.totalQuantity)} {item.unitLabel ?? "ед."}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Покупателей: {item.buyersCount} • Заказов: {item.ordersCount}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{formatAdminRub(item.totalRevenue)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">Для выбранной поставки сводка пока пуста.</p>
          )}
        </div>
      </SectionCard>
    </PageShell>
  );
}
