-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('buyer', 'admin');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('draft', 'open', 'closed', 'archived');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('created', 'accepted');

-- CreateEnum
CREATE TYPE "ProductUnitType" AS ENUM ('piece', 'weight', 'other');

-- CreateEnum
CREATE TYPE "SyncProvider" AS ENUM ('woocommerce');

-- CreateEnum
CREATE TYPE "SyncType" AS ENUM ('categories', 'products', 'full_catalog');

-- CreateEnum
CREATE TYPE "SyncRunStatus" AS ENUM ('running', 'success', 'failed');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'buyer',
  "displayName" TEXT NOT NULL,
  "username" TEXT,
  "firstName" TEXT,
  "lastName" TEXT,
  "locality" TEXT,
  "deliveryNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TelegramIdentity" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "telegramUserId" TEXT NOT NULL,
  "username" TEXT,
  "firstName" TEXT,
  "lastName" TEXT,
  "lastAuthAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TelegramIdentity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderBatch" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "sequence" INTEGER NOT NULL,
  "status" "BatchStatus" NOT NULL DEFAULT 'draft',
  "startsAt" TIMESTAMP(3),
  "closesAt" TIMESTAMP(3),
  "deliveryAt" TIMESTAMP(3),
  "customerMessage" TEXT,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrderBatch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Order" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "batchId" TEXT NOT NULL,
  "buyerId" TEXT NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'created',
  "subtotal" DECIMAL(12,2) NOT NULL,
  "comment" TEXT,
  "confirmedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderItem" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT,
  "productNameSnapshot" TEXT NOT NULL,
  "productSlugSnapshot" TEXT,
  "skuSnapshot" TEXT,
  "unitTypeSnapshot" "ProductUnitType" NOT NULL DEFAULT 'other',
  "unitLabelSnapshot" TEXT,
  "priceSnapshot" DECIMAL(12,2) NOT NULL,
  "quantity" DECIMAL(12,3) NOT NULL,
  "lineTotal" DECIMAL(12,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductCache" (
  "id" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "sku" TEXT,
  "name" TEXT NOT NULL,
  "imageUrl" TEXT,
  "price" DECIMAL(12,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'RUB',
  "unitType" "ProductUnitType" NOT NULL DEFAULT 'other',
  "unitLabel" TEXT,
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "isNew" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "rawMeta" JSONB,
  "syncedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductCache_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CategoryCache" (
  "id" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "parentId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "syncedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CategoryCache_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SyncRun" (
  "id" TEXT NOT NULL,
  "provider" "SyncProvider" NOT NULL,
  "syncType" "SyncType" NOT NULL,
  "status" "SyncRunStatus" NOT NULL DEFAULT 'running',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt" TIMESTAMP(3),
  "statsJson" JSONB,
  "errorText" TEXT,
  CONSTRAINT "SyncRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdminAuditLog" (
  "id" TEXT NOT NULL,
  "adminUserId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "payloadJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "_CategoryCacheToProductCache" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX "TelegramIdentity_userId_key" ON "TelegramIdentity"("userId");
CREATE UNIQUE INDEX "TelegramIdentity_telegramUserId_key" ON "TelegramIdentity"("telegramUserId");
CREATE UNIQUE INDEX "OrderBatch_code_key" ON "OrderBatch"("code");
CREATE UNIQUE INDEX "OrderBatch_year_sequence_key" ON "OrderBatch"("year", "sequence");
CREATE INDEX "OrderBatch_status_idx" ON "OrderBatch"("status");
CREATE UNIQUE INDEX "Order_code_key" ON "Order"("code");
CREATE UNIQUE INDEX "Order_batchId_buyerId_key" ON "Order"("batchId", "buyerId");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");
CREATE UNIQUE INDEX "ProductCache_externalId_key" ON "ProductCache"("externalId");
CREATE UNIQUE INDEX "ProductCache_slug_key" ON "ProductCache"("slug");
CREATE INDEX "ProductCache_isActive_idx" ON "ProductCache"("isActive");
CREATE INDEX "ProductCache_name_idx" ON "ProductCache"("name");
CREATE UNIQUE INDEX "CategoryCache_externalId_key" ON "CategoryCache"("externalId");
CREATE UNIQUE INDEX "CategoryCache_slug_key" ON "CategoryCache"("slug");
CREATE INDEX "CategoryCache_isActive_idx" ON "CategoryCache"("isActive");
CREATE INDEX "AdminAuditLog_entityType_entityId_idx" ON "AdminAuditLog"("entityType", "entityId");
CREATE UNIQUE INDEX "_CategoryCacheToProductCache_AB_unique" ON "_CategoryCacheToProductCache"("A", "B");
CREATE INDEX "_CategoryCacheToProductCache_B_index" ON "_CategoryCacheToProductCache"("B");

ALTER TABLE "TelegramIdentity"
  ADD CONSTRAINT "TelegramIdentity_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderBatch"
  ADD CONSTRAINT "OrderBatch_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_batchId_fkey"
  FOREIGN KEY ("batchId") REFERENCES "OrderBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_buyerId_fkey"
  FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrderItem"
  ADD CONSTRAINT "OrderItem_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderItem"
  ADD CONSTRAINT "OrderItem_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "ProductCache"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CategoryCache"
  ADD CONSTRAINT "CategoryCache_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "CategoryCache"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AdminAuditLog"
  ADD CONSTRAINT "AdminAuditLog_adminUserId_fkey"
  FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "_CategoryCacheToProductCache"
  ADD CONSTRAINT "_CategoryCacheToProductCache_A_fkey"
  FOREIGN KEY ("A") REFERENCES "CategoryCache"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_CategoryCacheToProductCache"
  ADD CONSTRAINT "_CategoryCacheToProductCache_B_fkey"
  FOREIGN KEY ("B") REFERENCES "ProductCache"("id") ON DELETE CASCADE ON UPDATE CASCADE;
