export const ORDER_STATUSES = ["created", "accepted"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
