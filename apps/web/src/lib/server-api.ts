import { cookies } from "next/headers";

function getApiBaseUrl() {
  return (
    process.env.API_INTERNAL_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:4000/api"
  );
}

async function buildServerAuthHeaders(authenticated: boolean) {
  if (!authenticated) {
    return undefined;
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("fh_session")?.value;
  const headers: Record<string, string> = {};

  if (sessionToken) {
    headers.Authorization = `Bearer ${sessionToken}`;
    return headers;
  }

  if (process.env.NEXT_PUBLIC_TELEGRAM_DEV_MODE === "true") {
    const role = cookieStore.get("fh_role")?.value === "admin" || process.env.NEXT_PUBLIC_DEV_USER_ROLE === "admin"
      ? "admin"
      : "buyer";

    headers["x-user-role"] = role;
    return headers;
  }

  return undefined;
}

export async function apiServerGet<T>(path: string, authenticated = false): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: "no-store",
    headers: await buildServerAuthHeaders(authenticated)
  });

  if (!response.ok) {
    throw new Error(`GET ${path} failed with status ${response.status}`);
  }

  const body = (await response.json()) as { data: T; ok: boolean };

  return body.data;
}
