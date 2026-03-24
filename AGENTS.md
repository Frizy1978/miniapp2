# AGENTS.md

## Project name
Fish Olha Mini App v2.1

## Mission
Build a Telegram Mini App + backend + admin interface for preorder collection based on the business requirements in:
- `fisholha_miniapp_tz_v2_1_for_codex.md`
- `fisholha_phase1_foundation_execution_plan_for_codex.md`

These two files are the primary source of truth for the project.

---

## Current development rule
Do not build the whole product in one pass.

Implement work in phases:
1. Phase 1 — foundation
2. Phase 2 — database + WooCommerce sync
3. Phase 3 — Telegram auth + bot
4. Phase 4 — buyer Mini App flows
5. Phase 5 — admin interface
6. Phase 6 — PDF export
7. Phase 7 — staging deploy
8. Phase 8 — production hardening

If the current task is Phase 1, do not jump ahead into full implementation of later phases.

---

## Core architectural rules

### 1. Source of catalog
WooCommerce is the source of truth for catalog data.
The app must not become a manually managed product catalog.

Use WooCommerce only for:
- categories
- product title
- image
- price
- slug / sku if available
- `_price_unit`
- optional flags like featured/new if available

The local database stores only synchronized cache/projection data.

### 2. Source of orders
Orders live only in the app database (PostgreSQL).
Do not use Google Sheets.
Do not make Google Sheets part of the architecture.

### 3. Payments
No online payment.
No payment gateway.
No Telegram payment.
Payment is cash on handoff.

### 4. Roles
Use role-based access:
- `buyer`
- `admin`

Buyer uses Telegram auth.
Admin should also use Telegram auth with role/allowlist-based access in MVP.

Do not build a separate login/password auth flow for admin unless explicitly requested later.

### 5. Admin visibility
Buyer must not see admin UI.
Buyer navigation must not contain admin links.
Admin UI should exist as a hidden separate area in the same project, for example `/admin`, protected by role checks.

### 6. Geography
Do not hardcode the system to one city.
Keep the architecture neutral so it can support multiple towns/areas later.

---

## UX and product rules

### Buyer area
The buyer flow must focus on:
- Main
- Catalog
- Category
- Cart
- Order confirmation
- Profile
- Order history

### Admin area
The admin flow must support:
- order batches
- orders grouped by customer
- consolidated product totals
- basic analytics
- PDF export

### Weight-based products
For weighted products, the buyer enters weight manually.
Do not force quantity-only logic for all products.

### Order editing
Buyer can edit their order while the current order batch is still open.
After batch closes, editing must be disabled.

### Order statuses for MVP
Only support:
- `created`
- `accepted`

Do not overengineer the status machine in early phases.

---

## UI rules
Use the provided Figma prototype as visual reference, but adapt it to the real business flow.

Allowed:
- add missing screens
- adjust screens for business requirements
- improve structure for buyer/admin needs

Required:
- keep buyer UI in Russian
- keep admin UI in Russian unless there is a strong reason otherwise

Do not spend effort on pixel-perfect polishing before the business flow is working.

---

## Engineering rules

### General
- Prefer small, safe, understandable changes
- Do not rewrite architecture without need
- Do not introduce unnecessary complexity
- Keep the repo clean and modular
- Use TypeScript everywhere reasonable

### Frontend
Recommended stack:
- Next.js
- React
- TypeScript
- Tailwind
- shadcn/ui
- Telegram WebApp SDK

### Backend
Recommended stack:
- Node.js
- TypeScript
- Prisma
- PostgreSQL

NestJS or modular Express are both acceptable if the structure stays clean.

### Shared package
Use `packages/shared` for:
- shared types
- enums
- contracts
- DTO-like shared structures where appropriate

### Database
Use Prisma.
Design for:
- `User`
- `OrderBatch`
- `Order`
- `OrderItem`
- `ProductCache`
- `CategoryCache`
- role model
- Telegram identity / auth binding
- safe historical storage

### WooCommerce sync
When implementing sync later:
- use upsert
- deactivate missing products instead of destructive deletion
- preserve historical order integrity

### PDF
When implementing PDF later:
- support printable output
- support grouped-by-customer view
- support consolidated product report

---

## Phase discipline

### If working on Phase 1
Only do:
- monorepo structure
- frontend scaffold
- backend scaffold
- shared package scaffold
- Prisma schema foundation
- route skeletons
- role model foundation
- docs
- env examples
- health endpoint
- basic guards/placeholders

Do not yet implement:
- full WooCommerce sync
- full Telegram auth
- bot launch
- PDF generation
- full order logic
- full admin analytics

---

## Documentation rules
Maintain:
- `README.md`
- `docs/architecture.md`
- `PROJECT_CONTEXT.md`

If major project decisions are made, update docs accordingly.

---

## Safety rails
Do not:
- add Google Sheets integration
- add online payment
- hardwire the app to a single town
- expose admin links to buyers
- build two unrelated auth systems
- turn ProductCache into the manual source of catalog truth

---

## How to work
Before large code changes:
1. summarize intended architecture
2. identify touched files
3. state assumptions
4. then implement

After changes:
1. summarize what was created/changed
2. list files changed
3. note any assumptions or open issues

---

## Current priority
The immediate priority is to build the project correctly from scratch with minimal architecture mistakes.

Current focus:
**Phase 1 / foundation only**, unless explicitly told to move to the next phase.