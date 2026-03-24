export type WooMetaData = {
  id?: number;
  key: string;
  value: unknown;
};

export type WooCategory = {
  image?: {
    id?: number;
    src?: string;
  } | null;
  id: number;
  name: string;
  parent: number;
  slug: string;
};

export type WooProductCategoryRef = {
  id: number;
  name: string;
  slug: string;
};

export type WooProductImage = {
  id: number;
  src: string;
};

export type WooProductTag = {
  id: number;
  name: string;
  slug: string;
};

export type WooProduct = {
  categories: WooProductCategoryRef[];
  featured: boolean;
  id: number;
  images: WooProductImage[];
  meta_data: WooMetaData[];
  name: string;
  price: string;
  regular_price?: string;
  sale_price?: string;
  sku: string;
  slug: string;
  status?: string;
  stock_quantity?: number | null;
  stock_status?: string;
  tags?: WooProductTag[];
};

export type WooSyncScope = "categories" | "products" | "full_catalog";

export type WooSyncStats = {
  categoriesProcessed: number;
  productsProcessed: number;
};
