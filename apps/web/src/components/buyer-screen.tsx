import type { ReactNode } from "react";

import { BuyerHeader } from "./buyer-header";
import { BuyerNav } from "./buyer-nav";

type BuyerScreenProps = {
  backHref?: string;
  children: ReactNode;
  headerMode?: "home" | "logo" | "title";
  showBottomNav?: boolean;
  subtitle?: string;
  title: string;
};

export function BuyerScreen({
  backHref,
  children,
  headerMode = "title",
  showBottomNav = true,
  subtitle,
  title
}: BuyerScreenProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-white px-4 pb-0 pt-0 sm:px-5">
      <BuyerHeader backHref={backHref} mode={headerMode} subtitle={subtitle} title={title} />
      <div className="space-y-5 pb-6">{children}</div>
      {showBottomNav ? <BuyerNav /> : null}
    </main>
  );
}
