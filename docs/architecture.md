# Architecture

## Goal
Phase 1 builds the project foundation for the Fish Olha Telegram Mini App without jumping into full WooCommerce sync, Telegram auth, bot launch, PDF export, or complete buyer/admin business logic.

## System Shape
- `apps/web`: Next.js frontend with buyer routes and a hidden admin zone in the same app.
- `apps/api`: NestJS API with health, auth scaffolding, role guards, module boundaries, and Prisma wiring.
- `packages/shared`: shared enums and API contract scaffolding for web and API.
- `apps/api/prisma`: PostgreSQL schema and initial migration.

## Buyer/Admin Split
- Buyer routes live in the public Mini App zone.
- Admin routes live under `/admin`.
- Buyer navigation never exposes admin links.
- Admin access is gated by a role boundary now and will later use Telegram auth plus allowlist.

## Data Ownership
- WooCommerce remains the source of truth for catalog data.
- Local catalog tables are cache/projection tables only.
- Orders live only in PostgreSQL.

## Auth Foundation
- Phase 1 uses a development placeholder user context.
- The API attaches a current user object from headers and environment defaults.
- Admin role can be simulated through allowlisted Telegram IDs or a dev header.
- Real Telegram Mini App `initData` validation is intentionally deferred.

## OrderBatch Model
- `OrderBatch` is the top-level collection unit for each preorder window.
- The intended lifecycle is `draft -> open -> closed -> archived`.
- Only one open batch is expected at a time in MVP logic, but that rule is left to service-layer logic in a later phase.

## Historical Integrity
- `OrderItem` stores product snapshots.
- This prevents catalog changes from mutating historical orders after WooCommerce sync updates cached products.

## Geography
- No city-specific assumptions are hardcoded.
- `User` already contains optional location fields for future delivery expansion.
