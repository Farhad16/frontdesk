# Backend image — builds shared types + NestJS, runs migrate + seed on boot.
FROM node:20-alpine
RUN apk add --no-cache openssl && npm install -g pnpm@9.12.0
WORKDIR /app

# Manifests first for cached installs.
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY packages/types/package.json packages/types/
COPY apps/backend/package.json apps/backend/
RUN pnpm install --no-frozen-lockfile

# Sources.
COPY packages/types ./packages/types
COPY apps/backend ./apps/backend

RUN pnpm -F @frontdesk/types build \
  && pnpm -F @frontdesk/backend exec prisma generate \
  && pnpm -F @frontdesk/backend build

EXPOSE 3001
CMD ["sh", "-c", "cd apps/backend && pnpm exec prisma migrate deploy && pnpm exec prisma db seed; node dist/main.js"]
