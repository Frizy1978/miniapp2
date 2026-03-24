import type { Request } from "express";

export type AuthenticatedUser = {
  displayName: string;
  firstName: string | null;
  id: string;
  isDevSession: boolean;
  lastName: string | null;
  role: "buyer" | "admin";
  telegramUserId: string;
  username: string | null;
};

export type RequestWithUser = Request & {
  user?: AuthenticatedUser;
};
