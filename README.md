# Frontdesk

Internal office request & group system — a WhatsApp-style portal where staff get **instant
phone push** the moment a request comes in. Built for the office hackathon (deadline **Mon 15
Jun 9am**).

> Status: **planning** — this folder currently holds the spec/plan docs for review. Code
> scaffolding comes after sign-off.

## What it is
A set of message groups (like WhatsApp groups), each a chat thread but with different behavior:

- **Requests** — tea/coffee/supplies/assistance via a tap-through builder, with status tracking
- **Breakfast** — food-menu builder (paratha/ruti, dal, egg) + free text
- **Lunch** — one-tap "Stop today's lunch" + free text

Flow: member posts → **staff get a push on their phone** → staff change status → member
tracks it live.

## Tech stack
- **Monorepo:** Turborepo + pnpm
- **Frontend:** React + Vite + PWA (`vite-plugin-pwa`, one service worker)
- **UI kit:** **@npm-questionpro/wick-ui-lib** components + **wick-ui-icon** (`wm-*`) + wick-ui
  theme/`--wu-*` tokens
- **Styling:** **CSS Modules** (`X.module.css`) + design tokens + modern native nesting (≤3
  levels). **No Tailwind, no hardcoded values.**
- **Backend:** NestJS + Prisma + PostgreSQL
- **Push:** Web Push (VAPID) — self-hosted, no cloud
- **Realtime:** SSE (Nest `@Sse()`)
- **Edge:** nginx single origin; cloudflared opt-in tunnel for phone HTTPS
- **Run:** `docker compose up` (single command)

## Docs (read in this order)
0. [`CLAUDE.md`](CLAUDE.md) — **start here**: project map, hard rules, conventions, build entry
1. [`docs/features/`](docs/features/README.md) — **one file per feature** (add/delete to change scope); registry + tiers
2. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — model, data, modules, infra
   · [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md) — canonical schema
   · [`docs/NON-FUNCTIONAL.md`](docs/NON-FUNCTIONAL.md) — RBAC, UX, consistency, a11y…
3. [`docs/DECISIONS.md`](docs/DECISIONS.md) — decision log + rationale
4. [`docs/BUILD-GUIDE.md`](docs/BUILD-GUIDE.md) — **step-by-step build** (order + commands + done-checks, links into specs)
5. [`docs/DEMO.md`](docs/DEMO.md) — 5-minute demo script + verification

To change scope: **add** a feature = new file in `docs/features/`; **remove** = delete its file;
**re-tier** = rename its `mvp-`/`stretch-`/`future-` prefix. Keep `docs/features/README.md` in sync.

## Planned quick start (after build)
```bash
docker compose up                      # localhost:3000 (desktop demo)
docker compose --profile tunnel up     # + HTTPS URL for phone demo
```
