# Codex Execution Plan — Phase 1 Foundation for Fish Olha Mini App v2.1

## Контекст
Используй файл `fisholha_miniapp_tz_v2_1_for_codex.md` как основной source of truth.

Этот документ задает **только Phase 1**, то есть:
- foundation проекта
- правильную структуру monorepo
- базовую архитектуру frontend/backend
- базовую Prisma schema
- базовые guards и role model
- базовую конфигурацию окружения
- каркас buyer/admin зон
- без полной реализации всей бизнес-логики сразу

---

# Главная цель этого этапа

Нужно **не строить весь продукт целиком в одном рывке**, а сначала создать **правильный каркас проекта**, на который потом будут наращиваться следующие этапы:

1. database
2. WooCommerce sync
3. Telegram auth + bot
4. buyer Mini App
5. admin interface
6. PDF export

---

# Что нужно сделать в этом этапе

## 1. Создать новый monorepo

Нужно создать новый репозиторий/проект с monorepo-структурой.

### Рекомендуемая структура
```text
root/
  apps/
    web/
    api/
  packages/
    shared/
  docs/
  prisma/   (если будет вынесено отдельно — только если это действительно нужно)
```

### Требования
- использовать npm workspaces или pnpm workspaces
- не усложнять турборепой/монорепой без необходимости, если это не дает явной пользы на старте
- каркас должен быть удобен для локальной разработки на Ubuntu 24.04 и дальнейшего переноса на VPS

### Ожидаемый результат
- root package.json
- workspace config
- apps/web
- apps/api
- packages/shared

---

## 2. Создать foundation frontend

### Что нужно сделать
В `apps/web` создать каркас frontend на:
- Next.js
- React
- TypeScript
- Tailwind
- shadcn/ui (если уместно)
- app router

### Что должно быть уже в этом этапе
- базовый layout
- buyer зона
- скрытая admin зона
- базовая навигационная структура
- role-aware route split
- заглушки экранов, а не полная реализация

### Обязательные route groups / зоны
Рекомендуемо предусмотреть:
- buyer app routes
- admin routes

Например:
- `/`
- `/catalog`
- `/cart`
- `/profile`
- `/admin`
- `/admin/batches`
- `/admin/orders`
- `/admin/analytics`

### Важно
Покупатель не должен видеть ссылки на admin routes.

---

## 3. Создать foundation backend

### Что нужно сделать
В `apps/api` создать каркас backend на:
- Node.js
- TypeScript
- NestJS или Express + модульная архитектура

### Рекомендация
Если нет жесткой причины использовать NestJS, можно использовать:
- Express + TypeScript
- модульную структуру
- Prisma
- понятные сервисы

Но если Codex считает, что NestJS даст более чистую архитектуру для:
- auth
- batch/order modules
- admin routes
- PDF export
то можно использовать NestJS.

### Что должно быть уже в этом этапе
- app bootstrap
- health endpoint
- env loading
- Prisma connection
- базовый auth scaffolding
- базовые role guards
- module skeletons

---

## 4. Спроектировать и создать базовую Prisma schema

### Задача
На этом этапе нужно **не реализовывать всю бизнес-логику**, а правильно спроектировать ядро БД.

### Обязательные сущности
Нужно предложить и создать базовую schema для:

- `User`
- `UserRole` или equivalent role model
- `TelegramIdentity` (если выделяете отдельно)
- `OrderBatch`
- `Order`
- `OrderItem`
- `ProductCache`
- `CategoryCache`

### Допускается добавить
- `AdminAuditLog`
- `SyncRun`
- `NotificationLog`
- `PdfExportLog`

Но только если это реально помогает и не перегружает Phase 1.

### Что важно в schema
Нужно уже предусмотреть:
- buyer/admin roles
- order editing flow
- batch lifecycle
- WooCommerce cache layer
- историчность заказов
- безопасную связь OrderItem ↔ ProductCache
- возможность soft deactivation товаров

### Важно
На этом этапе:
- можно создать schema и миграции
- можно подготовить enum-ы
- можно создать relations
- **не нужно** пока глубоко реализовывать production analytics logic

---

## 5. Сразу заложить правильную role model

### Нужно предусмотреть
- `buyer`
- `admin`

### Рекомендация
Сделать role model так, чтобы:
- buyer использовался по умолчанию
- admin определялся отдельной ролью
- в будущем можно было добавить `manager` / `operator`, если понадобится

### Важно
Нужно сразу сделать:
- frontend route guard / admin layout boundary
- backend role guard boundary

Но пока только каркас.

---

## 6. Подготовить auth foundation, но не реализовывать полностью Telegram auth

### На этом этапе не нужно полностью реализовывать Telegram auth
Но нужно подготовить foundation для него.

### Что должно быть
- auth module / auth service scaffold
- current user abstraction
- место для Telegram initData validation
- dev mode placeholder
- admin allowlist scaffold

### Что пока не нужно
- полная рабочая интеграция с Telegram Mini App
- bot launch
- menu button config
- production validation logic

Это будет отдельный этап позже.

---

## 7. Подготовить buyer/admin screen skeletons

Нужно создать именно **заглушки и структуру экранов**, а не всю готовую функциональность.

### Buyer screens skeleton
- Main
- Catalog
- Category
- Cart
- Order confirmation
- Profile
- Order history

### Admin screens skeleton
- Admin dashboard
- Batches list
- Batch details
- Orders by customer
- Consolidated products
- Analytics
- PDF export action entry points

### Требования
- экраны должны существовать как routes/components
- на них могут быть placeholder sections
- навигация должна быть понятна
- buyer zone не должна показывать admin UI

---

## 8. Подготовить shared package

В `packages/shared` создать то, что будет использовать и web, и api:

### Минимум
- shared types
- DTO / API contracts scaffold
- enums
- util types

### Примеры
- roles
- order statuses
- batch statuses
- product unit types, если нужно
- shared API response shapes

---

## 9. Подготовить env-структуру

Нужно создать и описать env foundation.

### Backend env
Нужно предусмотреть:
- DATABASE_URL
- WOOCOMMERCE_BASE_URL
- WOOCOMMERCE_CONSUMER_KEY
- WOOCOMMERCE_CONSUMER_SECRET
- TELEGRAM_BOT_TOKEN
- TELEGRAM_DEV_MODE
- TELEGRAM_MINI_APP_URL

### Frontend env
- NEXT_PUBLIC_API_BASE_URL
- NEXT_PUBLIC_TELEGRAM_DEV_MODE
- NEXT_PUBLIC_MINI_APP_URL

### Требование
Создать `.env.example` и понятные шаблоны env-файлов.

---

## 10. Подготовить docs foundation

Нужно создать базовую документацию в проекте:

### Минимум
- `README.md`
- `AGENTS.md`
- `docs/architecture.md`

### В README описать
- как поднять проект локально
- как запустить frontend
- как запустить backend
- как запустить PostgreSQL
- как применить Prisma migrations

### В architecture.md
- high-level архитектура
- buyer/admin split
- WooCommerce as source of catalog
- Telegram auth planned flow
- OrderBatch concept

---

# Что нельзя делать в этом этапе

Не нужно делать сейчас:
- полную WooCommerce sync logic
- полную Telegram auth integration
- bot launch logic
- полную buyer business logic
- полную admin business logic
- PDF rendering
- Google Sheets
- online payment
- production deploy scripts

---

# Что особенно важно не сломать в архитектуре

## 1. Не делать admin как отдельный второй проект без причины
Лучше заложить admin зону в том же frontend-проекте.

## 2. Не делать buyer/admin auth двумя хаотичными механизмами
Нужен один общий auth foundation, который потом будет завязан на Telegram + roles.

## 3. Не делать жёсткую привязку к одному городу
Архитектура должна оставаться нейтральной к географии.

## 4. Не делать каталог primary source в своей БД
Каталог должен быть cache/sync layer от WooCommerce, а не ручной каталог приложения.

---

# Что должен выдать Codex перед тем, как писать код

Сначала Codex должен:
1. кратко пересказать архитектуру, которую он собирается построить;
2. показать proposed monorepo structure;
3. показать список Prisma entities;
4. показать buyer/admin routes;
5. показать API module structure;
6. показать assumptions;
7. только после этого переходить к созданию foundation-кода.

---

# Что должен сделать Codex в коде на этом этапе

## Обязательно
1. создать monorepo structure
2. создать web app scaffold
3. создать api app scaffold
4. создать shared package
5. создать Prisma schema
6. создать initial migration
7. создать base layouts/routes
8. создать admin zone skeleton
9. создать buyer zone skeleton
10. создать env examples
11. создать README / AGENTS / architecture docs

## Желательно
12. добавить простейший health endpoint
13. добавить простейший DB health / Prisma wiring
14. добавить role guard scaffolding
15. добавить auth scaffolding placeholders

---

# Критерии приемки Phase 1

Считать этап выполненным, если:

1. проект создан как новый monorepo
2. web и api поднимаются локально
3. Prisma schema существует и миграции применяются
4. buyer/admin route skeletons существуют
5. admin зона не светится в buyer navigation
6. shared package существует
7. env examples существуют
8. docs существуют
9. архитектура не противоречит основному ТЗ
10. foundation готов для следующего этапа: database + WooCommerce sync + Telegram auth

---

# Формат ответа от Codex

Перед реализацией:
- summary архитектуры
- список файлов и директорий
- список сущностей БД
- список route groups
- assumptions

После реализации:
- список созданных файлов
- краткое описание структуры
- какие решения приняты по auth foundation
- какие решения приняты по admin zone
- какие решения приняты по Prisma schema foundation

---

# Главный приоритет
Сейчас нужен **не весь продукт**, а **правильный foundation проекта**, чтобы дальше не переделывать архитектуру заново.
