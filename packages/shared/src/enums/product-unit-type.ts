export const PRODUCT_UNIT_TYPES = ["piece", "weight", "other"] as const;

export type ProductUnitType = (typeof PRODUCT_UNIT_TYPES)[number];
