"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useCart } from "@/features/buyer/cart-context";

import { CartIcon } from "./buyer-icons";

type BuyerHeaderProps = {
  backHref?: string;
  mode?: "home" | "logo" | "title";
  subtitle?: string;
  title: string;
};

export function BuyerHeader({ backHref, mode = "title", subtitle, title }: BuyerHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { items } = useCart();
  const cartCount = items.length;
  const showCart = pathname !== "/cart" && mode !== "home";

  if (mode === "home") {
    return (
      <header className="px-2 pb-2 pt-6">
        <div className="flex flex-col items-center text-center">
          <img alt="Fish Olha" className="h-auto w-[180px]" src="/assets/logo_miniapp.png" />
          <h1 className="mt-6 max-w-[300px] text-[17px] font-semibold uppercase leading-7 tracking-[0.02em] text-[#2a7fbe]">
            {title}
          </h1>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-20 -mx-4 mb-5 border-b border-[#d7e7f2] bg-white px-4 pb-3 pt-4 shadow-[0_8px_18px_rgba(65,108,139,0.08)] sm:-mx-5 sm:px-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {backHref ? (
            <button
              aria-label="Назад"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dceaf3] text-lg text-[#2b86c7]"
              onClick={() => {
                if (backHref === "__back__") {
                  router.back();
                  return;
                }

                router.push(backHref);
              }}
              type="button"
            >
              ←
            </button>
          ) : (
            <Link href="/" className="flex items-center gap-2">
              <img alt="Fish Olha" className="h-auto w-[88px]" src="/assets/logo_miniapp.png" />
            </Link>
          )}
        </div>
        {showCart ? (
          <Link
            aria-label="Корзина"
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#dceaf3] text-[#2b86c7]"
          >
            <CartIcon className="h-6 w-6" />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[#0c959c] px-1.5 py-0.5 text-center text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
        ) : (
          <span className="h-10 w-10" />
        )}
      </div>
      {mode === "title" ? (
        <div className="pt-3 text-center">
          <h1 className="text-[21px] font-semibold text-[#2a7fbe]">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm leading-6 text-[#6988a2]">{subtitle}</p> : null}
        </div>
      ) : subtitle ? (
        <p className="pt-3 text-sm leading-6 text-[#6988a2]">{subtitle}</p>
      ) : null}
    </header>
  );
}
