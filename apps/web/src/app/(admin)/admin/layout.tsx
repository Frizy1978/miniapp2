import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AdminNav } from "@/components/admin-nav";
import { getDevSession } from "@/lib/dev-session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getDevSession();

  if (session.role !== "admin") {
    notFound();
  }

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-6xl gap-6 px-4 py-6 sm:grid-cols-[240px_minmax(0,1fr)] sm:px-6">
      <AdminNav />
      <div>{children}</div>
    </div>
  );
}
