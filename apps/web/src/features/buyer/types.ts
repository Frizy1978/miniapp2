export type BatchDto = {
  closesAt: string | null;
  code: string;
  customerMessage: string | null;
  deliveryAt: string | null;
  id: string;
  startsAt: string | null;
  status: "draft" | "open" | "closed" | "archived";
} | null;

export type CategoryDto = {
  id: string;
  imageUrl: string | null;
  name: string;
  parentId: string | null;
  slug: string;
};

export type ProductDto = {
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  id: string;
  imageUrl: string | null;
  isFeatured: boolean;
  isNew: boolean;
  name: string;
  price: string;
  rawMeta?: unknown;
  slug: string;
  sku?: string | null;
  unitLabel: string | null;
  unitType: "piece" | "weight" | "other";
};

export type OrderItemDto = {
  id: string;
  lineTotal: string;
  priceSnapshot: string;
  product?: {
    imageUrl: string | null;
  } | null;
  productId: string | null;
  productNameSnapshot: string;
  productSlugSnapshot: string | null;
  quantity: string;
  unitLabelSnapshot: string | null;
  unitTypeSnapshot: "piece" | "weight" | "other";
};

export type OrderDto = {
  batch: {
    code: string;
    deliveryAt: string | null;
    status: string;
  };
  code: string;
  comment: string | null;
  createdAt: string;
  id: string;
  items: OrderItemDto[];
  status: string;
  subtotal: string;
};
