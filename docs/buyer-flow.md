# Buyer Flow

## Phase 4 scope
Implemented now:
- buyer home reads current open batch
- catalog reads products and categories from API
- product page supports adding quantity or weight to cart
- cart is stored in localStorage
- checkout confirms and upserts order into the current open batch
- profile and order history read from buyer API routes
- existing order in current batch can be loaded back into cart for editing

## What buyer flow depends on
Before testing buyer flow:
1. PostgreSQL must be running
2. API must be running
3. Catalog must already be synced from WooCommerce
4. At least one batch must be open

## Create an open batch
Example PowerShell:

```powershell
$now = Get-Date
$body = @{
  closesAt = $now.AddDays(1).ToString("o")
  deliveryAt = $now.AddDays(2).ToString("o")
  customerMessage = "Прием заказов открыт"
  openNow = $true
} | ConvertTo-Json -Compress

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:4000/api/admin/batches" `
  -Headers @{ "x-user-role" = "admin" } `
  -ContentType "application/json" `
  -Body $body
```

## Local buyer test path
1. Open `http://localhost:3000`
2. Go to catalog
3. Add product to cart
4. Open checkout confirmation
5. Confirm order
6. Open profile history

## Local dev auth note
Until full Telegram Mini App runtime is exercised in-browser, local dev can still use:

```env
NEXT_PUBLIC_TELEGRAM_DEV_MODE=true
NEXT_PUBLIC_DEV_USER_ROLE=buyer
```

The frontend will send a dev role header when no signed Telegram session token exists.
