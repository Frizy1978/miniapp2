"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Панель" },
  { href: "/admin/batches", label: "Поставки" },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/products-summary", label: "Сводка по товарам" },
  { href: "/admin/analytics", label: "Аналитика" },
  { href: "/admin/exports", label: "Экспорт" }
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="rounded-[28px] border border-brand-100 bg-white p-4 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">Fish Olha Admin</p>
      <ul className="mt-4 space-y-2">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block rounded-2xl px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-brand-700 text-white shadow-sm"
                    : "text-slate-700 hover:bg-brand-50 hover:text-brand-800"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
