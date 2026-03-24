export type AdminBatchStatus = "draft" | "open" | "closed" | "archived";
export type AdminOrderStatus = "created" | "accepted";

export type AdminBatchListItem = {
  _count: {
    orders: number;
  };
  closesAt: string | null;
  code: string;
  createdAt: string;
  customerMessage: string | null;
  deliveryAt: string | null;
  startsAt: string | null;
  status: AdminBatchStatus;
};

export type AdminOverview = {
  analytics: {
    averageCheck: string | null;
    buyersCount: number;
    revenueEstimate: string | null;
  };
  batches: {
    current: null | {
      closesAt: string | null;
      code: string;
      customerMessage: string | null;
      deliveryAt: string | null;
      ordersCount: number;
      revenueEstimate: string | null;
      startsAt: string | null;
      status: AdminBatchStatus;
    };
    total: number;
  };
  catalog: {
    activeProducts: number;
    products: number;
  };
  foundation: boolean;
  orders: {
    latest: Array<{
      batchCode: string;
      buyerName: string;
      code: string;
      confirmedAt: string | null;
      itemsCount: number;
      quantityTotal: number;
      status: AdminOrderStatus;
      subtotal: string;
      username: string | null;
    }>;
    total: number;
  };
  sync: {
    configured: boolean;
    lastRun: null | {
      errorText: string | null;
      finishedAt: string | null;
      startedAt: string;
      status: string;
      syncType: string;
    };
    lastSyncAt: string | null;
  };
};

export type AdminOrderListItem = {
  batch: {
    closesAt: string | null;
    code: string;
    deliveryAt: string | null;
    status: AdminBatchStatus;
  };
  buyer: {
    deliveryNote: string | null;
    displayName: string;
    id: string;
    locality: string | null;
    telegramUserId: string | null;
    username: string | null;
  };
  code: string;
  comment: string | null;
  confirmedAt: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    lineTotal: string;
    productNameSnapshot: string;
    quantity: string;
    unitLabelSnapshot: string | null;
  }>;
  itemsCount: number;
  quantityTotal: number;
  status: AdminOrderStatus;
  subtotal: string;
  updatedAt: string;
};

export type AdminOrderDetails = {
  batch: {
    closesAt: string | null;
    code: string;
    customerMessage: string | null;
    deliveryAt: string | null;
    startsAt: string | null;
    status: AdminBatchStatus;
  };
  buyer: {
    deliveryNote: string | null;
    displayName: string;
    firstName: string | null;
    lastName: string | null;
    locality: string | null;
    telegramUserId: string | null;
    username: string | null;
  };
  code: string;
  comment: string | null;
  confirmedAt: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    imageUrl: string | null;
    lineTotal: string;
    priceSnapshot: string;
    productId: string | null;
    productNameSnapshot: string;
    productSlugSnapshot: string | null;
    quantity: string;
    skuSnapshot: string | null;
    unitLabelSnapshot: string | null;
    unitTypeSnapshot: string;
  }>;
  status: AdminOrderStatus;
  subtotal: string;
  updatedAt: string;
};

export type AdminProductsSummary = {
  batch: null | {
    closesAt: string | null;
    code: string;
    deliveryAt: string | null;
    startsAt: string | null;
    status: AdminBatchStatus;
  };
  items: Array<{
    buyersCount: number;
    imageUrl: string | null;
    name: string;
    ordersCount: number;
    productId: string | null;
    slug: string | null;
    totalQuantity: string;
    totalRevenue: string;
    unitLabel: string | null;
  }>;
  totals: {
    buyersCount: number;
    ordersCount: number;
    quantityTotal: string;
    revenue: string;
    uniqueProducts: number;
  };
};

export type AdminBatchDetails = {
  batch: {
    _count: {
      orders: number;
    };
    closesAt: string | null;
    code: string;
    createdAt: string;
    createdBy: null | {
      displayName: string;
      telegramIdentity: null | {
        telegramUserId: string;
      };
      username: string | null;
    };
    customerMessage: string | null;
    deliveryAt: string | null;
    startsAt: string | null;
    status: AdminBatchStatus;
  };
  orders: AdminOrderListItem[];
  products: AdminProductsSummary["items"];
  totals: {
    buyersCount: number;
    ordersCount: number;
    quantityTotal: string;
    subtotal: string;
    uniqueProducts: number;
  };
};
