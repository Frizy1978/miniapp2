export const USER_ROLES = ["buyer", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];
