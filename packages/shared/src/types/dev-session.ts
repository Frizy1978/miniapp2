import type { UserRole } from "../enums";

export type DevSession = {
  role: UserRole;
  telegramUserId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
};
