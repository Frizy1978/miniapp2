import Link from "next/link";

import { AdminBatchActions } from "@/components/admin-batch-actions";
import { AdminCreateBatchForm } from "@/components/admin-create-batch-form";
import { PageShell } from "@/components/page-shell";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import type { AdminBatchListItem } from "@/features/admin/contracts";
import { formatAdminDate, getBatchStatusLabel } from "@/features/admin/format";
import { apiServerGet } from "@/lib/server-api";

function getBatchTone(status: AdminBatchListItem["status"]) {
  if (status === "open" || status === "closed" || status === "archived") {
    return status;
  }

  return "draft";
}

export default async function AdminBatchesPage() {
  const batches = await apiServerGet<AdminBatchListItem[]>("/admin/batches", true);

  return (
    <PageShell
      eyebrow="Phase 5"
      title="Поставки"
      description="Управление окнами приема заказов. Здесь можно создавать новую поставку, открывать или закрывать существующую и смотреть сводку по каждой."
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <SectionCard title="Новая поставка" description="Создание нового окна приема заказов без перехода в backend tools.">
          <AdminCreateBatchForm />
        </SectionCard>

        <SectionCard title="История поставок" description="Актуальные статусы и быстрый переход к деталям поставки.">
          <div className="space-y-3">
            {batches.length ? (
              batches.map((batch) => (
                <div key={batch.code} className="rounded-[22px] border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/admin/batches/${batch.code}`}
                        className="text-lg font-semibold text-slate-900 transition hover:text-brand-700"
                      >
                        {batch.code}
                      </Link>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusPill tone={getBatchTone(batch.status)} label={getBatchStatusLabel(batch.status)} />
                        <span className="text-xs text-slate-500">Заказов: {batch._count.orders}</span>
                      </div>
                    </div>
                    <AdminBatchActions code={batch.code} status={batch.status} />
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                    <p>Старт: {formatAdminDate(batch.startsAt)}</p>
                    <p>Прием до: {formatAdminDate(batch.closesAt)}</p>
                    <p>Доставка: {formatAdminDate(batch.deliveryAt)}</p>
                  </div>

                  {batch.customerMessage ? (
                    <p className="mt-3 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-slate-700">
                      {batch.customerMessage}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">Поставки еще не создавались.</p>
            )}
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
