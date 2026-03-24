import { PageShell } from "@/components/page-shell";
import { SectionCard } from "@/components/section-card";
import type { AdminOverview } from "@/features/admin/contracts";
import { formatAdminDate, formatAdminRub } from "@/features/admin/format";
import { apiServerGet } from "@/lib/server-api";

export default async function AdminAnalyticsPage() {
  const overview = await apiServerGet<AdminOverview>("/admin/analytics/overview", true);

  return (
    <PageShell
      eyebrow="Phase 5"
      title="Аналитика"
      description="Базовая операционная аналитика поверх уже работающих order и catalog flows. Без продвинутой BI-логики, но с реальными admin-метриками."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SectionCard title="Всего заказов">
          <p className="text-3xl font-semibold text-slate-900">{overview.orders.total}</p>
        </SectionCard>
        <SectionCard title="Покупатели">
          <p className="text-3xl font-semibold text-slate-900">{overview.analytics.buyersCount}</p>
        </SectionCard>
        <SectionCard title="Средний чек">
          <p className="text-3xl font-semibold text-slate-900">{formatAdminRub(overview.analytics.averageCheck)}</p>
        </SectionCard>
        <SectionCard title="Оборот">
          <p className="text-3xl font-semibold text-slate-900">{formatAdminRub(overview.analytics.revenueEstimate)}</p>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Каталог">
          <div className="space-y-2 text-sm text-slate-700">
            <p>Всего товаров: {overview.catalog.products}</p>
            <p>Активных товаров: {overview.catalog.activeProducts}</p>
          </div>
        </SectionCard>

        <SectionCard title="Интеграции">
          <div className="space-y-2 text-sm text-slate-700">
            <p>WooCommerce настроен: {overview.sync.configured ? "да" : "нет"}</p>
            <p>Последняя синхронизация: {formatAdminDate(overview.sync.lastSyncAt)}</p>
            <p>
              Последний run:{" "}
              {overview.sync.lastRun
                ? `${overview.sync.lastRun.syncType} • ${overview.sync.lastRun.status}`
                : "еще не запускался"}
            </p>
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
