import type { ReactNode } from "react";

import { CartProvider } from "@/features/buyer/cart-context";

export default function BuyerLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-[#fbf7f1]">{children}</div>
    </CartProvider>
  );
}
