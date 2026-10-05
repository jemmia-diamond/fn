# AGENTS.md

Guidance for coding agents working in this repo. Human docs live in `README.md` and `docs/`.

## Overview

`fn` is a serverless integration service (HonoJS on Cloudflare Workers) that syncs data between Haravan (e‑commerce), Pancake (chat/CRM), NocoDB (internal workspace DB), Jemmia ERP (Frappe), and Larksuite. Work is driven by HTTP webhooks (`src/routes/`, `src/controllers/`) and scheduled cron jobs (`src/services/schedule-handler.js`). Data access is Prisma (Postgres via `@prisma/adapter-pg`) and the NocoDB REST API.

## Setup

- Requires Node ≥ 24 and pnpm.
- `pnpm install`
- Local config/secrets live in `.dev.vars` (Wrangler); deployed secrets are Wrangler secrets. Never commit or print secret values.

## Commands

- `pnpm dev` — run locally (`wrangler dev`)
- `pnpm build` — `prisma migrate deploy && prisma generate`
- `pnpm deploy` — `wrangler deploy` (note: `main` auto‑deploys on merge)
- `pnpm lint` — eslint; `pnpm format` — `eslint --fix`

## Verifying changes

There is no automated test suite. Before pushing:

1. `pnpm lint` must pass (also runs on staged files via lint-staged + husky).
2. Exercise the affected path — the webhook route/controller, or the cron in `src/services/schedule-handler.js`.
3. Runtime failures in webhook/cron work are reported to Sentry (`@sentry/cloudflare`); check there after deploy.

## Architecture: two data planes

The app talks to **two separate stores**. Using the wrong one is the top source of production bugs here — decide which plane a table belongs to before writing data code.

### Prisma / Postgres — operational schemas

Covers the schemas in `prisma/schema.prisma` `datasource.schemas` (`pancake`, `haravan`, `larksuite`, `ecom`, `payment`, `promotion`, …). Models are in `prisma/models/*.prisma`; the client is `src/services/database.ts` (`Database.instance(env)`).

- Prefer the Prisma ORM (`findFirst` / `updateMany` / …) over `` db.$queryRaw` ``. Parameterized `$queryRaw` tagged templates are unreliable on the Workers runtime; the ORM binds params safely. Use raw only for what the ORM can't express (JSONB paths, `REFRESH MATERIALIZED VIEW`), and prefer fetching the column and computing in JS.

### NocoDB — Supply / Marketing / R&D bases (source of truth)

These workspace bases (`designs`, `variants`, `variant_serials`, `temporary_products`, `jewelries`, `diamonds`, `submitted_codes`, …) are NocoDB‑managed. They back onto a Postgres `workplace` schema that is **not** modeled in Prisma and **not** in `datasource.schemas`.

- Access these tables via the NocoDB REST client `src/services/clients/nocodb-client.js` (`NocoDBClient` — `listRecords`, `getTableMeta`, `updateRecords`, `updateColumn`, …), using table ids from `src/constants/nocodb-tables.js` (`NOCODB_TABLES.{SUPPLY,MARKETING,RD}.*`).
- Do not `$queryRaw` against `workplace.*`: there is no Prisma model (`db.temporaryProducts` is `undefined`) and it bypasses NocoDB validation and webhooks.
- Filter syntax: `listRecords(tableId, { where: "(field,eq,value)", fields: "col1,col2", limit: 1 })`.
- NocoDB fires webhooks to `https://fn.jemmia.vn/webhook/noco/*`; handlers are under `src/controllers/webhook/nocodb/` (routed in `src/routes/webhook.js`).

Per‑base reference (ERDs, tables, webhook maps) — consult before adding a NocoDB read/write or a `/webhook/noco/*` handler, and update the matching file (verified against the live NocoDB meta API) if you change tables or webhooks:

- [`docs/supply.md`](docs/supply.md) — Supply base `pl4e7zwnui0k8y1`
- [`docs/marketing.md`](docs/marketing.md) — Marketing base `pbzopuiobhc8xf1`
- [`docs/r_d.md`](docs/r_d.md) — R&D base `pb27venes8j6u17`

## Code style

- ESM throughout.
- Imports use path aliases only (`services/*`, `controllers/*`, `routes/*`, … per `jsconfig.json`). Relative imports are lint‑blocked (`custom/no-relative-imports`).
- Match the conventions of the surrounding file; let `eslint --fix` handle formatting.

## Commits & PRs

- Conventional Commits, enforced by commitlint; keep the subject ≤ 100 chars.
- Branch off `main` and open a PR into `main` (which auto‑deploys on merge). Reference the Sentry issue or ticket the change addresses in the PR body.
