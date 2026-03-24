"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { AdminBatchStatus } from "@/features/admin/contracts";
import { apiPost } from "@/lib/client-api";

type AdminBatchActionsProps = {
  code: string;
  status: AdminBatchStatus;
};

export function AdminBatchActions({ code, status }: AdminBatchActionsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAction = (action: "open" | "close") => {
    setError(null);
    startTransition(() => {
      void (async () => {
        try {
          await apiPost(`/admin/batches/${code}/${action}`, {}, true);
          router.refresh();
        } catch (actionError) {
          setError(actionError instanceof Error ? actionError.message : "Не удалось обновить статус поставки.");
        }
      })();
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {status !== "open" ? (
          <button
            type="button"
            onClick={() => handleAction("open")}
            disabled={isPending}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Сохраняем..." : "Открыть"}
          </button>
        ) : null}
        {status === "open" ? (
          <button
            type="button"
            onClick={() => handleAction("close")}
            disabled={isPending}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Сохраняем..." : "Закрыть"}
          </button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
