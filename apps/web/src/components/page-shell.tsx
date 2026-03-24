import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
};

export function PageShell({ children, eyebrow, title, description }: PageShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      <section className="rounded-[28px] bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 p-6 text-white shadow-card">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-100">{eyebrow}</p>
        ) : null}
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-50 sm:text-base">{description}</p>
      </section>
      {children}
    </main>
  );
}
