# Agent Guide — fn

HonoJS app on Cloudflare Workers. Prisma (Postgres via `@prisma/adapter-pg`) + NocoDB. ESM, Node ≥ 24, pnpm.

## Commands

- `pnpm dev` — `wrangler dev`
- `pnpm build` — `prisma migrate deploy && prisma generate`
- `pnpm deploy` — `wrangler deploy` (auto-deploys on merge to `main`)
- `pnpm lint` / `pnpm format` — eslint (`--fix`)

## Two data planes — read this before touching data code

The app talks to **two separate stores**. Using the wrong one is the top source of production bugs here.

### 1. Prisma / Postgres — operational schemas

Prisma models cover schemas listed in `prisma/schema.prisma` `datasource.schemas` (e.g. `pancake`, `haravan`, `larksuite`, `ecom`, `payment`, `promotion`, …). Models live in `prisma/models/*.prisma`. Client built in `src/services/database.ts` (`Database.instance(env)`).

- **Prefer the Prisma ORM (`findFirst`/`updateMany`/…) over `` db.$queryRaw` ``.** Parameterized `$queryRaw` tagged templates are unreliable on the Workers runtime; the ORM binds params safely. Use raw only for what the ORM can't express (JSONB paths, `REFRESH MATERIALIZED VIEW`), and prefer fetching the column + computing in JS.

### 2. NocoDB — workspace/"workplace" bases (source of truth)

The **Supply, Marketing, and R&D** workspace bases (tables like `designs`, `variants`, `variant_serials`, `temporary_products`, `jewelries`, `diamonds`, `submitted_codes`, …) are **NocoDB-managed**. They back onto a Postgres `workplace` schema, but that schema is **NOT modeled in Prisma** and is **not** in `datasource.schemas`.

- **Never `$queryRaw` against `workplace.*`.** There is no Prisma model for these tables (`db.temporaryProducts` etc. is `undefined`), and direct Postgres access bypasses NocoDB validation and webhooks.
- **Access these tables via the NocoDB REST client:** `src/services/clients/nocodb-client.js` (`NocoDBClient` — `listRecords`, `getTableMeta`, `updateRecords`, `updateColumn`, …), with table ids from `src/constants/nocodb-tables.js` (`NOCODB_TABLES.{SUPPLY,MARKETING,RD}.*`).
- Filter syntax: `listRecords(tableId, { where: "(field,eq,value)", fields: "col1,col2", limit: 1 })`.
- NocoDB emits webhooks to `https://fn.jemmia.vn/webhook/noco/*` on record changes; handlers live under `src/controllers/webhook/nocodb/` (routed in `src/routes/webhook.js`).

**NocoDB base reference (ERDs, tables, webhook maps):**

- [`docs/supply.md`](docs/supply.md) — Supply base `pl4e7zwnui0k8y1`
- [`docs/marketing.md`](docs/marketing.md) — Marketing base `pbzopuiobhc8xf1`
- [`docs/r_d.md`](docs/r_d.md) — R&D base `pb27venes8j6u17`

Consult these when adding a NocoDB read/write or a `/webhook/noco/*` handler. If you change NocoDB tables or webhooks, update the matching doc (verify against live via the NocoDB meta API).

## Conventions

- **Imports:** path aliases only (`services/*`, `controllers/*`, … per `jsconfig.json`). Relative imports are lint-blocked (`custom/no-relative-imports`).
- **Commits:** Conventional Commits, enforced by commitlint; `eslint --fix` runs on staged files (lint-staged + husky). Keep the subject ≤ 100 chars.
- **Scheduling:** cron work is registered in `src/services/schedule-handler.js` and `wrangler.jsonc` `triggers.crons`.
- **Errors:** background/cron work reports to Sentry (`@sentry/cloudflare`).
