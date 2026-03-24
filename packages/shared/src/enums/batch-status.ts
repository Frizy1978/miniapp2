export const BATCH_STATUSES = ["draft", "open", "closed", "archived"] as const;

export type BatchStatus = (typeof BATCH_STATUSES)[number];
