"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CartIcon, GridIcon, HomeIcon, ProfileIcon } from "./buyer-icons";

const links = [
  { href: "/", icon: HomeIcon, label: "Главная" },
  { href: "/catalog", icon: GridIcon, label: "Каталог" },
  { href: "/cart", icon: CartIcon, label: "Корзина" },
  { href: "/profile", icon: ProfileIcon, label: "Профиль" }
];

export function BuyerNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 -mx-4 mt-auto border-t border-[#d7e7f2] bg-white px-2 pb-3 pt-2 sm:-mx-5">
      <ul className="grid grid-cols-4 gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] transition ${
                  isActive ? "text-[#2b86c7]" : "text-[#6f7f8a]"
                }`}
              >
                <Icon className="h-6 w-6" />
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
