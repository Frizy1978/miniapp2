import type { Metadata } from "next";
import type { ReactNode } from "react";

import { TelegramSessionBridge } from "@/components/telegram-session-bridge";
import { TelegramRuntimeGuard } from "@/components/telegram-runtime-guard";

import "./globals.css";

export const metadata: Metadata = {
  title: "Fish Olha Mini App",
  description: "Foundation for Fish Olha Telegram Mini App and admin panel"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <TelegramSessionBridge />
        <TelegramRuntimeGuard />
        {children}
      </body>
    </html>
  );
}
