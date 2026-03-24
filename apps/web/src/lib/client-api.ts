"use client";

import { buildAuthHeaders } from "./client-auth";

export async function apiGet<T>(path: string, authenticated = false): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: authenticated ? buildAuthHeaders() : undefined
  });

  if (!response.ok) {
    throw new Error(`GET ${path} failed with status ${response.status}`);
  }

  const body = (await response.json()) as { data: T; ok: boolean };

  return body.data;
}

export async function apiPost<T>(path: string, body: unknown, authenticated = false): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      ...(authenticated ? buildAuthHeaders() : {})
    },
    method: "POST"
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`POST ${path} failed with status ${response.status}: ${errorText}`);
  }

  const payload = (await response.json()) as { data: T; ok: boolean };

  return payload.data;
}

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
}
