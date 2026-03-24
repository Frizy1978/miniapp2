export function formatDisplayName(parts: Array<string | null | undefined>): string {
  const filtered = parts.map((part) => part?.trim()).filter(Boolean);

  return filtered.length > 0 ? filtered.join(" ") : "Пользователь";
}
