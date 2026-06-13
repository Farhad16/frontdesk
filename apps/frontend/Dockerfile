# Frontend image — Vite build served by nginx (proxies /api to the backend).
FROM node:20-alpine AS build
RUN npm install -g pnpm@9.12.0
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY packages/types/package.json packages/types/
COPY apps/frontend/package.json apps/frontend/
RUN pnpm install --no-frozen-lockfile

COPY packages/types ./packages/types
COPY apps/frontend ./apps/frontend
RUN pnpm -F @frontdesk/types build && pnpm -F @frontdesk/frontend build

FROM nginx:alpine
COPY infra/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
