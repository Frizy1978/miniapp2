type StatusPillProps = {
  tone?: "open" | "closed" | "draft" | "archived" | "accepted";
  label: string;
};

export function StatusPill({ tone = "draft", label }: StatusPillProps) {
  const styles = {
    accepted: "bg-sky-50 text-sky-700",
    archived: "bg-slate-100 text-slate-700",
    closed: "bg-rose-50 text-rose-700",
    draft: "bg-amber-50 text-amber-700",
    open: "bg-emerald-50 text-emerald-700"
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[tone]}`}>
      {label}
    </span>
  );
}
