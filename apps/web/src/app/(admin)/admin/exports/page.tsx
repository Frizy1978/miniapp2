import { AdminExportActions } from "@/components/admin-export-actions";
import { PageShell } from "@/components/page-shell";
import { SectionCard } from "@/components/section-card";
import type { AdminBatchListItem, AdminProductsSummary } from "@/features/admin/contracts";
import { formatAdminDate, formatAdminRub, getBatchStatusLabel } from "@/features/admin/format";
import { apiServerGet } from "@/lib/server-api";

export default async function AdminExportsPage({
  searchParams
}: {
  searchParams: Promise<{ batch?: string }>;
}) {
  const { batch } = await searchParams;
  const batches = await apiServerGet<AdminBatchListItem[]>("/admin/batches", true);
  const selectedBatchCode = batch ?? batches.find((item) => item.status === "open")?.code ?? batches[0]?.code;
  const summary = selectedBatchCode
    ? await apiServerGet<AdminProductsSummary>(
        `/admin/products-summary?batch=${encodeURIComponent(selectedBatchCode)}`,
        true
      )
    : null;

  return (
    <PageShell
      eyebrow="Phase 6"
      title="PDF экспорт"
      description="Генерация печатных PDF-документов по выбранной поставке: отдельная ведомость по покупателям и отдельная сводка по товарам."
    >
      <SectionCard title="Выбор поставки">
        <div className="flex flex-wrap gap-2">
          {batches.length ? (
            batches.map((item) => (
              <a
                key={item.code}
                href={`/admin/exports?batch=${encodeURIComponent(item.code)}`}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selectedBatchCode === item.code
                    ? "bg-brand-700 text-white hover:bg-brand-600"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {item.code}
              </a>
            ))
          ) : (
            <p className="text-sm text-slate-600">Поставок пока нет.</p>
          )}
        </div>
      </SectionCard>

      {selectedBatchCode && summary ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <SectionCard title={`Поставка ${selectedBatchCode}`}>
            <div className="space-y-2 text-sm text-slate-700">
              <p>Статус: {summary.batch ? getBatchStatusLabel(summary.batch.status) : "—"}</p>
              <p>Прием до: {formatAdminDate(summary.batch?.closesAt ?? null)}</p>
              <p>Доставка: {formatAdminDate(summary.batch?.deliveryAt ?? null)}</p>
              <p>Покупателей: {summary.totals.buyersCount}</p>
              <p>Товаров: {summary.totals.uniqueProducts}</p>
              <p>Сумма: {formatAdminRub(summary.totals.revenue)}</p>
            </div>
          </SectionCard>

          <SectionCard
            title="Скачать документы"
            description="PDF формируются на backend и подходят для дальнейшей печати или отправки."
          >
            <AdminExportActions batchCode={selectedBatchCode} />
          </SectionCard>
        </div>
      ) : (
        <SectionCard title="PDF экспорт" description="Сначала создайте хотя бы одну поставку." />
      )}
    </PageShell>
  );
}
