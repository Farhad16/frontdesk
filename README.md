# Frontdesk

Internal office request & group portal — a WhatsApp-style app where members place orders in
group threads and staff fulfil them, with **live updates** and **web-push notifications**.

Three groups, each a thread with its own behaviour:

- **Requests** — drinks / snacks / assistance via a tap-through order builder, with status tracking
- **Breakfast** — food-menu builder (paratha, ruti, sides, egg) + free text
- **Lunch** — one-tap "Stop my lunch" + lunch-off by date/range + free text

Flow: member places an order → **staff get a push** → staff move it `pending → in progress → done`
→ member tracks it **live** (SSE), and gets a push when it's done.

## Tech stack

- **Monorepo:** Turborepo + pnpm (`apps/backend`, `apps/frontend`, `packages/types`)
- **Backend:** NestJS + Prisma + PostgreSQL
- **Frontend:** React + Vite + react-router + PWA (`vite-plugin-pwa`, one service worker)
- **UI:** `@npm-questionpro/wick-ui-lib` components + `--fd-*` design tokens (CSS Modules, no Tailwind)
- **Realtime:** SSE (Nest `@Sse()`); **Push:** self-hosted Web Push (VAPID)
- **Edge:** nginx single origin; cloudflared opt-in tunnel for phone HTTPS

## Run it — single command

Requires Docker.

```bash
docker compose up --build
```

Then open **http://localhost:3000**.

- `db` (Postgres) + `api` (NestJS, runs migrate + seed on boot) + `web` (nginx serving the build, proxying `/api`).
- Phone push demo (HTTPS tunnel): `docker compose --profile tunnel up` → open the printed `*.trycloudflare.com` URL.

### Demo accounts

- **Staff:** `karim@kitchen.local` / `staff123` (or `rofiq@kitchen.local`)
- **Member:** sign up with any `@questionpro.com` email (role is derived from the email domain)

## Local development

```bash
pnpm install
pnpm -C packages/types build
cp apps/backend/.env.example apps/backend/.env   # fresh clone only
docker compose up -d db                          # Postgres only
pnpm -C apps/backend exec prisma migrate deploy && pnpm -C apps/backend exec prisma db seed
pnpm turbo dev                                    # backend :3001, frontend :5173
```

Frontend dev: http://localhost:5173 (proxies `/api` → `:3001`).

## Features

Auth (JWT cookie, role-by-domain, Google-SSO seam) · groups home with previews + unread ·
message thread (text / quick / request / system bubbles, day separators) · multi-item order
builder + Quick Picks (saved defaults) + personal add-ons · order status tracking (role-scoped)
· staff per-group queue with filters · lunch quick-actions + lunch-off dates · message deletion
(soft, tombstone) · realtime SSE · web-push + installable PWA · settings (language en/bn,
notification prefs, availability).

## Demo script (≈5 min)

1. Member opens **Requests**, builds "☕ Tea ×2 + 🍪 Biscuit" → sends one order bubble (Pending).
2. Staff (Queue) sees it live → **Start** → **Done**; member's thread + a push update live.
3. Member sets a **Quick Pick** for coffee → one-tap reorder.
4. **Breakfast** order via the builder; **Lunch** → "Stop my lunch" / off-on-date.
5. Switch language to **বাংলা** in settings — whole UI re-renders.
6. Architecture: one repo, SSE + VAPID (no cloud), `docker compose up` only.

## Notes

- Demo secrets (JWT, VAPID keys) are committed in `docker-compose.yml` — **demo-only**.
- Not yet built: bulk delete, full Bangla strings, email verify / password reset (need a mailer).
