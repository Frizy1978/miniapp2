import type { AdminBatchStatus, AdminOrderStatus } from "./contracts";

export function formatAdminRub(value: number | string | null | undefined) {
  const numericValue =
    typeof value === "number" ? value : typeof value === "string" ? Number.parseFloat(value) : Number.NaN;

  if (!Number.isFinite(numericValue)) {
    return "0 руб.";
  }

  return `${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(numericValue) ? 0 : 2
  }).format(numericValue)} руб.`;
}

export function formatAdminQuantity(value: number | string | null | undefined) {
  const numericValue =
    typeof value === "number" ? value : typeof value === "string" ? Number.parseFloat(value) : Number.NaN;

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 3
  }).format(numericValue);
}

export function formatAdminDate(value: string | Date | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "long",
    year: "numeric"
  });
}

export function formatAdminDateShort(value: string | Date | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

export function getBatchStatusLabel(status: AdminBatchStatus) {
  const labels: Record<AdminBatchStatus, string> = {
    archived: "Архив",
    closed: "Закрыт",
    draft: "Черновик",
    open: "Открыт"
  };

  return labels[status];
}

export function getOrderStatusLabel(status: AdminOrderStatus) {
  const labels: Record<AdminOrderStatus, string> = {
    accepted: "Принят",
    created: "Создан"
  };

  return labels[status];
}
