import type { UserRole } from "../enums";

export type CurrentUserDto = {
  id: string;
  role: UserRole;
  telegramUserId: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName: string;
  isDevSession: boolean;
};
