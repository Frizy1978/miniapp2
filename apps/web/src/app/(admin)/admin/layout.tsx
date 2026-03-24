import Link from "next/link";
import type { ReactNode } from "react";

import { AdminNav } from "@/components/admin-nav";
import { apiServerGet } from "@/lib/server-api";
import { getDevSession } from "@/lib/dev-session";

type AuthMeResponse = {
  role: "admin" | "buyer";
} | null;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getDevSession();
  const currentUser = await apiServerGet<AuthMeResponse>("/auth/me", true).catch(() => null);
  const isAdmin = session.role === "admin" || currentUser?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-xl items-center px-4 py-10">
        <div className="w-full rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Admin Access</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">Админская сессия не найдена</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Открой Mini App из Telegram под admin-аккаунтом, чтобы получить admin session. После авторизации
            обнови эту страницу.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Открыть Mini App
            </Link>
            <Link
              href="/api/health"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Проверить API
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-6xl gap-6 px-4 py-6 sm:grid-cols-[240px_minmax(0,1fr)] sm:px-6">
      <AdminNav />
      <div>{children}</div>
    </div>
  );
}
