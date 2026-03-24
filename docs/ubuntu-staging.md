# Ubuntu Staging

## Что входит в staging-слой

- `docker-compose.staging.yml`
  - `postgres`
  - `api`
  - `web`
  - `proxy` на `Caddy`
- `apps/api/Dockerfile`
- `apps/web/Dockerfile`
- `infra/staging/Caddyfile`
- staging env templates

## Архитектура staging

- браузер ходит в API по публичному URL:
  - `NEXT_PUBLIC_API_BASE_URL=https://<staging-domain>/api`
- server-side Next внутри контейнера ходит в API по внутреннему URL:
  - `API_INTERNAL_BASE_URL=http://api:4000/api`
- PostgreSQL не публикуется наружу
- `proxy` принимает `80/443` и маршрутизирует:
  - `/` -> `web:3000`
  - `/api/*` -> `api:4000`

## Подготовка Ubuntu 24.04

1. Установить Docker Engine и Docker Compose plugin
2. Установить Git
3. Открыть порты `80` и `443`
4. Подготовить домен или поддомен, например `staging.fisholha.ru`
5. Направить DNS на IP staging VM

## Подготовка env

1. В корне:
   - `.env.staging.example` -> `.env.staging`
2. Для API:
   - `apps/api/.env.staging.example` -> `apps/api/.env.staging`
3. Для web:
   - `apps/web/.env.staging.example` -> `apps/web/.env.staging`

Минимально заполнить:
- `STAGING_DOMAIN`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `API_CORS_ORIGIN`
- `WOOCOMMERCE_*`
- `TELEGRAM_BOT_*`
- `TELEGRAM_MINI_APP_URL`
- `ADMIN_TELEGRAM_IDS`
- `NEXT_PUBLIC_API_BASE_URL`
- `API_INTERNAL_BASE_URL`
- `NEXT_PUBLIC_MINI_APP_URL`

## Запуск staging

Из корня проекта:

```bash
npm run staging:up
```

Остановить:

```bash
npm run staging:down
```

Логи:

```bash
npm run staging:logs
```

## Проверка после запуска

1. Открыть:
   - `https://<staging-domain>`
2. Проверить health:
   - `https://<staging-domain>/api/health`
3. Проверить admin:
   - `https://<staging-domain>/admin`
4. Проверить PDF export
5. Проверить Woo sync
6. Проверить Telegram Mini App launch URL в `BotFather`

## Telegram для staging

- `TELEGRAM_MINI_APP_URL` должен совпадать с staging domain
- если хочешь максимально близко к production:
  - `TELEGRAM_DEV_MODE=false`
  - `NEXT_PUBLIC_REQUIRE_TELEGRAM_RUNTIME=true`
- если хочешь сначала дебажить staging через обычный браузер:
  - временно оставь `NEXT_PUBLIC_REQUIRE_TELEGRAM_RUNTIME=false`

## Ограничения текущего staging-слоя

- Caddy используется как staging proxy, потому что для Ubuntu VM это быстрее и проще, чем сразу собирать production Nginx/SSL слой
- production hardening, backup policy и monitoring остаются следующим этапом
