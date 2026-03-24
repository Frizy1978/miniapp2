"use client";

function getCookieValue(name: string): string | null {
  const cookies = document.cookie.split(";").map((entry) => entry.trim());
  const match = cookies.find((entry) => entry.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export function buildAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const sessionToken =
    window.localStorage.getItem("fh_session") || getCookieValue("fh_session");

  if (sessionToken) {
    headers.Authorization = `Bearer ${sessionToken}`;
    return headers;
  }

  if (process.env.NEXT_PUBLIC_TELEGRAM_DEV_MODE === "true") {
    headers["x-user-role"] = process.env.NEXT_PUBLIC_DEV_USER_ROLE ?? "buyer";
  }

  return headers;
}
