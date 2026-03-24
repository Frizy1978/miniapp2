# WooCommerce Sync

## Phase 2 scope
Implemented now:
- WooCommerce REST client
- manual sync trigger
- category upsert into `CategoryCache`
- product upsert into `ProductCache`
- missing products are soft-deactivated
- missing categories are soft-deactivated
- product-category relations are refreshed during sync
- sync run history is stored in `SyncRun`

Not implemented yet:
- scheduler / cron
- webhook-based sync
- advanced retry policy
- buyer flow on top of synced catalog

## Required env
Set real values in `apps/api/.env`:

```env
WOOCOMMERCE_BASE_URL=https://fisholha.ru
WOOCOMMERCE_CONSUMER_KEY=ck_xxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxx
```

## Manual sync
The endpoint is admin-protected:

```http
POST /api/admin/integrations/woocommerce/sync
```

Body:

```json
{ "scope": "full_catalog" }
```

Allowed scopes:
- `categories`
- `products`
- `full_catalog`

## Local dev auth note
Until Telegram auth is implemented, local admin requests can use the header:

```http
x-user-role: admin
```

## Example PowerShell
```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:4000/api/admin/integrations/woocommerce/sync" `
  -Headers @{ "x-user-role" = "admin" } `
  -ContentType "application/json" `
  -Body '{"scope":"full_catalog"}'
```

## Status endpoint
```http
GET /api/admin/integrations/woocommerce/status
```

This returns:
- whether WooCommerce is configured
- cached category and product counts
- latest sync run metadata

## Catalog read endpoints
Public catalog endpoints now read from PostgreSQL cache:

```http
GET /api/catalog/categories
GET /api/catalog/products
GET /api/catalog/products?search=горб
GET /api/catalog/products?category=konservy
GET /api/catalog/products?featured=true
GET /api/catalog/products?isNew=true
GET /api/catalog/products/:slug
```
