# Telegram Auth And Bot

## Phase 3 scope
Implemented now:
- Telegram Mini App `initData` validation on backend
- user upsert into `User` and `TelegramIdentity`
- signed backend session token
- request auth via `Authorization: Bearer <token>` or `x-session-token`
- bot status endpoint
- bot setup endpoint for menu button and commands
- optional long polling bot runtime
- `/start` and `/app` handlers that return a Mini App button

Not implemented yet:
- webhook deployment
- buyer notifications
- admin notifications on new orders
- production-grade frontend session store

## Required backend env
Add real values in `apps/api/.env`:

```env
TELEGRAM_BOT_TOKEN=...
TELEGRAM_BOT_USERNAME=...
TELEGRAM_MINI_APP_URL=https://staging.fisholha.ru
TELEGRAM_BOT_ENABLE_POLLING=false
TELEGRAM_INIT_DATA_MAX_AGE_SECONDS=86400
TELEGRAM_SESSION_TTL_SECONDS=2592000
ADMIN_TELEGRAM_IDS=123456789
```

## Mini App auth endpoint
```http
POST /api/auth/telegram/miniapp
```

Body:

```json
{ "initData": "query_id=...&user=...&auth_date=...&hash=..." }
```

Response:
- validated user object
- signed session token

## Bot admin endpoints
Admin-only routes:

```http
GET /api/admin/integrations/telegram-bot/status
POST /api/admin/integrations/telegram-bot/setup
POST /api/admin/integrations/telegram-bot/send-start
```

`setup` configures:
- chat menu button to open the Mini App
- bot commands `/start` and `/app`

`send-start` body:

```json
{ "chatId": 123456789 }
```

## Optional polling mode
Set:

```env
TELEGRAM_BOT_ENABLE_POLLING=true
```

Then the API process will:
- call `deleteWebhook`
- start polling updates
- respond to `/start` and `/app`

This is intended for local or staging validation. Production may later switch to webhook mode.
