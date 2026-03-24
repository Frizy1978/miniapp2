import { cookies } from "next/headers";

import type { UserRole } from "@fisholha/shared";

export type DevSession = {
  role: UserRole;
};

export async function getDevSession(): Promise<DevSession> {
  const cookieStore = await cookies();
  const cookieRole = cookieStore.get("fh_role")?.value;
  const envRole = process.env.NEXT_PUBLIC_DEV_USER_ROLE;
  const role = cookieRole === "admin" || envRole === "admin" ? "admin" : "buyer";

  return { role };
}
