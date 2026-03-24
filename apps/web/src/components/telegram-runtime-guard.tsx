"use client";

import { useEffect, useState } from "react";

export function TelegramRuntimeGuard() {
  const [checked, setChecked] = useState(false);
  const [isTelegramRuntime, setIsTelegramRuntime] = useState(true);
  const requireTelegramRuntime = process.env.NEXT_PUBLIC_REQUIRE_TELEGRAM_RUNTIME === "true";

  useEffect(() => {
    if (!requireTelegramRuntime) {
      return;
    }

    const webApp = window.Telegram?.WebApp;
    setIsTelegramRuntime(Boolean(webApp));
    setChecked(true);
  }, [requireTelegramRuntime]);

  if (!requireTelegramRuntime || !checked || isTelegramRuntime) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#0e2334]/82 p-6">
      <div className="w-full max-w-sm rounded-[22px] bg-white p-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
        <p className="text-[22px] font-semibold text-[#1f1f1f]">Открытие вне Telegram</p>
        <p className="mt-3 text-sm leading-6 text-[#5d6f7f]">
          Это приложение настроено только для запуска внутри Telegram Mini App.
        </p>
      </div>
    </div>
  );
}
