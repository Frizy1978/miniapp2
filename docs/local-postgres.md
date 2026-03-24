# Local PostgreSQL With Docker Compose

## Why this setup
- The same Compose-based PostgreSQL setup can be used on Windows, Ubuntu VM, and an initial VPS deployment.
- This keeps local, staging, and first production environments close to each other.
- PostgreSQL data is stored in a named Docker volume instead of the repo.

## Files
- `docker-compose.yml`
- `.env.docker.example`

## First-time setup
1. Copy `.env.docker.example` to `.env.docker`.
2. Adjust values only if you need different credentials or port mapping.
3. Copy `apps/api/.env.example` to `apps/api/.env`.
4. Set `DATABASE_URL` in `apps/api/.env` to:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fisholha_miniapp?schema=public
```

If you change any value in `.env.docker`, update `DATABASE_URL` to match.

## Start PostgreSQL
```bash
docker compose up -d postgres
```

Or through npm:

```bash
npm run db:up
```

## Check container health
```bash
docker compose ps
docker compose logs -f postgres
```

Or:

```bash
npm run db:logs
```

## Prisma workflow
After PostgreSQL is healthy:

```bash
npm run prisma:generate
npm run prisma:migrate:dev
```

## Stop PostgreSQL
```bash
docker compose down
```

Named volume data remains preserved. If you later need a destructive reset, remove the volume manually and only do that intentionally.

## Ubuntu / VPS notes
- Keep the same `docker-compose.yml`.
- Use a stronger password in `.env.docker`.
- Keep PostgreSQL bound to `127.0.0.1` unless you explicitly need remote DB access.
- Back up the named volume with regular `pg_dump`.
- Pin the PostgreSQL image version instead of using `latest`.
