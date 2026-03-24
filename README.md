# Fish Olha Mini App

Phase 1 foundation for a Telegram Mini App, API, and hidden admin panel for preorder collection. The repository follows these source-of-truth documents:

- `fisholha_miniapp_tz_v2_1_for_codex.md`
- `fisholha_phase1_foundation_execution_plan_for_codex.md`

## Monorepo
- `apps/web`: Next.js buyer and admin web foundation
- `apps/api`: NestJS API, Prisma schema, auth and role scaffolding
- `packages/shared`: shared enums and API contracts

## Local setup
1. Copy Docker env:
   - `.env.docker.example` -> `.env.docker`
2. Copy app env files:
   - `apps/api/.env.example` -> `apps/api/.env`
   - `apps/web/.env.example` -> `apps/web/.env.local`
3. Start PostgreSQL:
   - `docker compose up -d postgres`
   - or `npm run db:up`
4. Install dependencies from the repo root:
   - `npm install`
5. Generate the Prisma client:
   - `npm run prisma:generate`
6. Apply the initial migration:
   - `npm run prisma:migrate:dev`

## Run
- Web:
  - `npm run dev:web`
- API:
  - `npm run dev:api`

## Ubuntu staging
1. Copy staging env files:
   - `.env.staging.example` -> `.env.staging`
   - `apps/api/.env.staging.example` -> `apps/api/.env.staging`
   - `apps/web/.env.staging.example` -> `apps/web/.env.staging`
2. Fill the real staging domain, database password, Woo keys, and Telegram secrets
3. Start staging stack:
   - `npm run staging:up`
4. Check:
   - `https://<staging-domain>`
   - `https://<staging-domain>/api/health`

## Database
- Docker Compose file: [docker-compose.yml](./docker-compose.yml)
- Local PostgreSQL guide: [docs/local-postgres.md](./docs/local-postgres.md)
- Ubuntu staging guide: [docs/ubuntu-staging.md](./docs/ubuntu-staging.md)
- Buyer flow guide: [docs/buyer-flow.md](./docs/buyer-flow.md)
- Telegram auth and bot guide: [docs/telegram-auth-bot.md](./docs/telegram-auth-bot.md)
- WooCommerce sync guide: [docs/woocommerce-sync.md](./docs/woocommerce-sync.md)
- PDF export guide: [docs/pdf-export.md](./docs/pdf-export.md)
- Default Prisma connection string for local Docker:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fisholha_miniapp?schema=public
```

## Phase 1 scope
Included:
- monorepo structure
- web and API scaffolds
- buyer/admin route skeletons
- Prisma foundation schema
- env examples
- docs
- health endpoint
- auth and role placeholders

Not included:
- full WooCommerce sync
- full Telegram auth
- bot launch
- PDF rendering
- full buyer business logic
- full admin business logic

## Notes
- Buyer must not see admin links.
- WooCommerce remains the source of truth for catalog data.
- Orders live only in PostgreSQL.
- Payment is cash on handoff.

## Current phase additions
- catalog endpoints now read from PostgreSQL cache
- manual WooCommerce sync endpoint is available for admin
- sync runs are recorded in `SyncRun`
- Telegram Mini App auth endpoint is available
- bot status/setup endpoints are available
- optional bot polling mode can answer `/start` and `/app`
- buyer flow supports cart, checkout, order upsert, and order history
