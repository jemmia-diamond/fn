# fn — Agent Guide

The canonical guide is [`AGENTS.md`](AGENTS.md). Read it before working on data code.

Key rule: workplace/NocoDB tables (Supply/Marketing/R&D bases — `designs`, `variants`, `temporary_products`, …) are NOT Prisma models. Access them via `NocoDBClient` REST (`src/services/clients/nocodb-client.js` + `src/constants/nocodb-tables.js`), never `$queryRaw`. Prefer the Prisma ORM over `$queryRaw` everywhere — edge WASM `$queryRaw` throws "Invalid array buffer length".

NocoDB base reference: [`docs/supply.md`](docs/supply.md), [`docs/marketing.md`](docs/marketing.md), [`docs/r_d.md`](docs/r_d.md).
