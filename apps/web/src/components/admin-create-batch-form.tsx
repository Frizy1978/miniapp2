"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useMemo, useState, useTransition } from "react";

import { apiPost } from "@/lib/client-api";

function toInputDateTime(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function AdminCreateBatchForm() {
  const router = useRouter();
  const defaults = useMemo(() => {
    const now = new Date();
    const closesAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const deliveryAt = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    return {
      closesAt: toInputDateTime(closesAt),
      deliveryAt: toInputDateTime(deliveryAt)
    };
  }, []);
  const [closesAt, setClosesAt] = useState(defaults.closesAt);
  const [deliveryAt, setDeliveryAt] = useState(defaults.deliveryAt);
  const [customerMessage, setCustomerMessage] = useState("");
  const [openNow, setOpenNow] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(() => {
      void (async () => {
        try {
          await apiPost(
            "/admin/batches",
            {
              closesAt: new Date(closesAt).toISOString(),
              customerMessage: customerMessage.trim() || undefined,
              deliveryAt: new Date(deliveryAt).toISOString(),
              openNow
            },
            true
          );
          setCustomerMessage("");
          router.refresh();
        } catch (submitError) {
          setError(submitError instanceof Error ? submitError.message : "Не удалось создать поставку.");
        }
      })();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Прием заказов до</span>
          <input
            type="datetime-local"
            value={closesAt}
            onChange={(event) => setClosesAt(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            required
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Доставка</span>
          <input
            type="datetime-local"
            value={deliveryAt}
            onChange={(event) => setDeliveryAt(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            required
          />
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium text-slate-700">
        <span>Сообщение покупателю</span>
        <textarea
          value={customerMessage}
          onChange={(event) => setCustomerMessage(event.target.value)}
          rows={3}
          className="w-full rounded-[20px] border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          placeholder="Например: прием заявок открыт до завтра 15:00."
        />
      </label>

      <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={openNow}
          onChange={(event) => setOpenNow(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        <span>Сразу открыть новую поставку и закрыть предыдущую</span>
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Создаем..." : "Создать поставку"}
        </button>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </div>
    </form>
  );
}
