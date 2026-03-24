"use client";

import { useEffect } from "react";

type TelegramAuthResponse = {
  data: {
    token: string;
    user: {
      role: "buyer" | "admin";
    };
  };
  ok: boolean;
};

export function TelegramSessionBridge() {
  useEffect(() => {
    const webApp = window.Telegram?.WebApp;

    if (!webApp) {
      return;
    }

    webApp.ready();

    if (!webApp.initData) {
      return;
    }

    void authenticateMiniApp(webApp.initData);
  }, []);

  return null;
}

async function authenticateMiniApp(initData: string) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/auth/telegram/miniapp`, {
      body: JSON.stringify({ initData }),
      credentials: "omit",
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      return;
    }

    const body = (await response.json()) as TelegramAuthResponse;

    if (!body.ok) {
      return;
    }

    document.cookie = `fh_session=${body.data.token}; Path=/; Max-Age=2592000; SameSite=Lax`;
    document.cookie = `fh_role=${body.data.user.role}; Path=/; Max-Age=2592000; SameSite=Lax`;
    window.localStorage.setItem("fh_session", body.data.token);
  } catch {
    // Silent on purpose: in dev and non-Telegram contexts the app should still load.
  }
}
