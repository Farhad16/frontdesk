# CLAUDE.md — Frontdesk

Guidance for Claude Code (and humans) building this repo. **Read this first**, then the linked
specs. This file connects everything; it does not duplicate detail.

## What this is
Internal office hub: WhatsApp-style **groups** (Requests / Breakfast / Lunch) where requests are
posted via a tap-through **cart builder**, **staff get instant phone push**, manage **status**,
and members track live. Self-contained, one `docker compose up`. Hackathon, solo, deadline
**Mon 15 Jun 9am**, demo ≤5 min.

## Doc map (source of truth)
- **Build order → [`docs/BUILD-GUIDE.md`](docs/BUILD-GUIDE.md)** — 18 steps, commands, done-checks.
- **Features → [`docs/features/`](docs/features/README.md)** — one file per feature; tier prefix
  (`mvp-`/`stretch-`/`future-`). Add a feature = new file; remove = delete it.
- **Schema → [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md)** — canonical Prisma model. **Schema wins.**
- **Architecture → [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)** — model, modules, infra, UI-kit/styling.
- **Quality bars → [`docs/NON-FUNCTIONAL.md`](docs/NON-FUNCTIONAL.md)** — RBAC, UX, consistency, a11y.
- **UI mockups → [`docs/mockups/proto/`](docs/mockups/proto/index.html)** — navigable, one page
  per feature (mobile + desktop side by side). Each feature `.md` links its mockup.
  **Build the UI to MATCH its mockup** — the mockup is the visual source-of-truth.
- **Component/theme reference → [`docs/DESIGN-REFERENCE.md`](docs/DESIGN-REFERENCE.md)** — wick-ui
  Storybook (theme, `--wu-*` tokens, icons, full component list + app mapping). **No DataGrid/Table
  or Segmented in wick-ui** → queue = Card list + table; toggles = Tabs/Radio.
- **Why → [`docs/DECISIONS.md`](docs/DECISIONS.md)** · **Demo → [`docs/DEMO.md`](docs/DEMO.md)** ·
  **Menus → [`docs/features/catalogs.md`](docs/features/catalogs.md)**.

**Precedence:** if any doc disagrees → DATA-MODEL (schema) and the relevant feature file win over
BUILD-GUIDE/ARCHITECTURE. Fix the spec, not the guide.

## Stack (locked)
Turborepo + pnpm · `apps/web` React+Vite+PWA · `apps/api` NestJS+Prisma · `packages/types` shared ·
PostgreSQL · nginx single origin · cloudflared (named tunnel, opt-in) · `docker compose up`.

## Hard rules (non-negotiable — see DECISIONS.md)
1. **Styling:** CSS Modules only (`X.tsx` → `X.module.css`), `var(--wu-*)` **tokens**, modern
   **native nesting ≤3**. **No Tailwind. No hardcoded hex/px.**
2. **UI kit:** build on **wick-ui-lib** components + **wick-ui-icon** (`wm-*`) + wick-ui theme.
   Reuse (staff queue = Card list + table (no DataGrid), option toggles = Tabs/Radio, WuButton/Input/Select/
   Checkbox/Toast). Don't hand-roll what wick-ui provides.
3. **i18n:** store **structured keys** in DB, never English. UI via `t(key)`; user free-text shown
   as typed. Request `summary` rendered from per-item **sentence templates** per locale.
4. **Push:** self-hosted **Web Push (VAPID)** via `web-push`. **No FCM.** One service worker.
5. **Realtime:** **SSE** (`@Sse`), not WebSocket. Single API instance (Redis = future).
6. **Auth/RBAC:** JWT **httpOnly cookie** (manual login + Google verify). Every role/owner action
   **enforced server-side** (`RolesGuard`), not just hidden in UI.
7. **Self-contained:** `docker compose up` must work from a clean public clone, no manual steps,
   no secrets requiring tokens (wick-ui pkgs are public; demo VAPID/JWT committed as demo-only).
8. **Status:** `pending→in_progress→done` (+`cancelled`). Staff advance only; member cancels
   own while pending. Soft-delete (tombstone), never hard-wipe.
9. **Request = multi-item cart** (one message, one row, one status).

## Scope discipline
- **Build MVP first** (11 features), then Stretch (5) only when Docker is green. **Never build
  Future** (7) — leave the seams noted in DATA-MODEL.
- Under time pressure follow the **cut order** in
  [`features/README.md`](docs/features/README.md#demo-critical-priority-protect-vs-cut-first).
  Protect the headline loop: request → phone push → status, on the staff queue.

## Before you build X, read Y
- a feature → its `docs/features/<file>.md` (behavior + acceptance) + linked deps.
- anything touching the DB → `DATA-MODEL.md`.
- any UI → the feature's **mockup** (`docs/mockups/proto/<x>.html`, linked from the feature
  `.md`) — build to match it — plus ARCHITECTURE §UI-kit (wick-ui map) + NON-FUNCTIONAL.
- a catalog/menu change → `catalogs.md`.

## Conventions
- TypeScript everywhere; share contracts via `packages/types` (enums, DTOs, group configs, catalogs).
- One feature = one doc; keep `features/README.md` index in sync when adding/removing.
- Commits: `type(scope): subject` (conventional). Public repo. No secrets beyond demo-only.

## Commands (planned)
```bash
pnpm install
pnpm turbo run dev                 # web + api
docker compose up                  # full app → http://localhost:3000
docker compose --profile tunnel up # + HTTPS named tunnel (phone/SSO)
pnpm prisma migrate dev / db seed
```

## Known gotchas
- **Phone push needs HTTPS** (localhost is exempt) → named cloudflared tunnel for the phone demo.
- **iOS:** Web Push only on an **installed** PWA, iOS 16.4+; no Background Sync (offline outbox is
  foreground-only).
- **Google SSO redirect** needs a **stable** URL (localhost works; phone needs the named tunnel
  registered in Firebase). Manual login is the always-works fallback.
- **SSE behind nginx:** `proxy_buffering off` + long read timeout; client refetches once on reconnect.
