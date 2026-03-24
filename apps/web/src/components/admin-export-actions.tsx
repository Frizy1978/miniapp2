"use client";

import { useState, useTransition } from "react";

import { buildAuthHeaders } from "@/lib/client-auth";
import { getApiBaseUrl } from "@/lib/client-api";

type AdminExportActionsProps = {
  batchCode: string;
};

export function AdminExportActions({ batchCode }: AdminExportActionsProps) {
  const [error, setError] = useState<string | null>(null);
  const [activeExport, setActiveExport] = useState<"customers" | "products" | null>(null);
  const [isPending, startTransition] = useTransition();

  const downloadExport = (kind: "customers" | "products") => {
    setError(null);
    setActiveExport(kind);

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch(
            `${getApiBaseUrl()}/admin/exports/${kind}?batch=${encodeURIComponent(batchCode)}`,
            {
              headers: buildAuthHeaders()
            }
          );

          if (!response.ok) {
            throw new Error(`Export failed with status ${response.status}`);
          }

          const blob = await response.blob();
          const fileName = response.headers
            .get("content-disposition")
            ?.match(/filename="(.+)"/)?.[1] ?? `fisholha-${batchCode}-${kind}.pdf`;
          const objectUrl = window.URL.createObjectURL(blob);
          const link = document.createElement("a");

          link.href = objectUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(objectUrl);
        } catch (downloadError) {
          setError(downloadError instanceof Error ? downloadError.message : "Не удалось скачать PDF.");
        } finally {
          setActiveExport(null);
        }
      })();
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => downloadExport("customers")}
          className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {activeExport === "customers" ? "Готовим PDF..." : "PDF по покупателям"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => downloadExport("products")}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {activeExport === "products" ? "Готовим PDF..." : "PDF по товарам"}
        </button>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
