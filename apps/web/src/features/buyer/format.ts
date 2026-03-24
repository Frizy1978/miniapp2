export function formatRub(value: number | string, minimumFractionDigits?: number) {
  const numericValue = typeof value === "number" ? value : Number.parseFloat(value);

  if (!Number.isFinite(numericValue)) {
    return "0 руб.";
  }

  const fractionDigits = minimumFractionDigits ?? (Number.isInteger(numericValue) ? 0 : 2);

  return `${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
    minimumFractionDigits: fractionDigits
  }).format(numericValue)} руб.`;
}

export function formatQuantity(value: number | string) {
  const numericValue = typeof value === "number" ? value : Number.parseFloat(value);

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 3
  }).format(numericValue);
}

export function formatUnitPrice(price: number | string, unitLabel: string | null) {
  return unitLabel ? `${formatRub(price)} / ${unitLabel}` : formatRub(price);
}
