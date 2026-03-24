FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN npm ci

COPY packages/shared packages/shared
COPY apps/api apps/api

WORKDIR /app/apps/api
RUN npx prisma generate

WORKDIR /app
RUN npm run build --workspace @fisholha/shared && npm run build --workspace @fisholha/api

EXPOSE 4000

CMD ["sh", "-c", "cd /app/apps/api && npx prisma migrate deploy && node dist/main.js"]
