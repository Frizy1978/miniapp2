import type { ProductUnitType } from "../enums";

export type CategoryListItemDto = {
  id: string;
  imageUrl: string | null;
  slug: string;
  name: string;
  parentId: string | null;
};

export type ProductListItemDto = {
  id: string;
  slug: string;
  name: string;
  price: string;
  unitType: ProductUnitType;
  unitLabel: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  isNew: boolean;
};
