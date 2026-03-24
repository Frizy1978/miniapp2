# PROJECT_CONTEXT.md

## Project
Fish Olha Mini App v2.1

## Project root
`E:\\aiprojects\\miniapp2`

## Current status
This is a fresh restart of the project.

A previous version/prototype existed, but we are intentionally rebuilding from scratch because the business logic and architecture need to be corrected and simplified.

The new version must follow:
- `fisholha_miniapp_tz_v2_1_for_codex.md`
- `fisholha_phase1_foundation_execution_plan_for_codex.md`

These files define the current correct direction.

---

## Business summary
There is a live WooCommerce store on `fisholha.ru`.

Several times per month the store delivers products to remote locations/areas.
Customers should place preorder requests through a Telegram Mini App.

Important:
- no online payment
- payment is cash on handoff
- catalog comes from WooCommerce
- order data lives in the app database
- admin works through an internal admin interface
- no Google Sheets

---

## Accepted product decisions

### 1. Admin interface
Admin interface should be a hidden separate web area in the same project, for example `/admin`.

Why:
- easier to build tables, reports, analytics, PDF export
- buyer does not need to know it exists
- buyer must not see admin links or menu items

### 2. Buyer auth
Buyer uses Telegram Mini App auth.

### 3. Admin auth
For MVP, admin should also use Telegram auth plus role-based access / allowlist by Telegram user ID.

Separate login/password auth is not needed right now.

### 4. Order editing
Buyer can edit their existing order while the active order batch is still open.
When batch closes, order editing is disabled.

### 5. Weight-based products
For weighted products, buyer enters weight manually.

### 6. Order statuses
For MVP, use only:
- `created`
- `accepted`

### 7. Geography
Do not hardcode the app to a single city.
Keep the model neutral for broader area coverage in future versions.

---

## Intended system parts

### Buyer-facing
- Telegram bot
- Telegram Mini App
- buyer screens:
  - Main
  - Catalog
  - Category
  - Cart
  - Order confirmation
  - Profile
  - Order history

### Admin-facing
- hidden admin web interface
- batch management
- orders by customer
- consolidated products
- analytics
- PDF export

### Backend
- API
- PostgreSQL
- WooCommerce sync
- Telegram auth
- notifications to admin

---

## Deployment approach

### Current local development
- Windows host
- project folder: `E:\\aiprojects\\miniapp2`
- development assisted by Codex
- staging/runtime also being prepared on Ubuntu 24.04 VM in VirtualBox

### Staging / external access
Staging/public hostnames being used:
- `staging.fisholha.ru`
- `api-staging.fisholha.ru`

These point to the Ubuntu VM / future deploy target.

### Long-term deployment
The app should later be moved to VPS hosting.

---

## Current development phase
We are at:

**Phase 1 — foundation**

This means:
- create monorepo
- create frontend scaffold
- create backend scaffold
- create shared package
- create Prisma schema foundation
- create route skeletons
- create role model foundation
- create docs
- create env examples

Do not jump directly into:
- full WooCommerce sync
- full Telegram auth
- buyer full business flow
- full admin feature set
- PDF implementation

Those come later.

---

## Immediate goal for Codex
Codex should first:
1. analyze the two markdown source-of-truth files
2. propose monorepo structure
3. propose Prisma entities
4. list buyer/admin routes
5. state assumptions
6. then implement Phase 1 foundation only

---

## Constraints
Must not introduce:
- Google Sheets
- online payments
- unnecessary second admin auth system
- buyer-visible admin navigation
- destructive catalog ownership inside app DB

---

## Design reference
Use the provided Figma prototype as visual reference, but adapt it to the real business flow and add missing screens.

The app should not be a literal clone of the Figma prototype if business requirements require changes.

---

## Notes for future phases

### Phase 2
Database completion + WooCommerce sync foundation

### Phase 3
Telegram Mini App auth + bot launch

### Phase 4
Buyer flow implementation

### Phase 5
Admin interface implementation

### Phase 6
PDF export

### Phase 7
Staging hardening

### Phase 8
Production deploy preparation

---

## Working style
Prefer:
- simple architecture
- modular code
- clear separation of concerns
- minimal hidden magic
- safe incremental progress

Avoid:
- giant one-shot generation of the whole product
- unnecessary rewrites
- overengineering too early