See @AGENTS.md for the project guide (stack, commands, the Prisma-vs-NocoDB data planes, and the NocoDB base docs).

Key rule: workplace/NocoDB tables (Supply/Marketing/R&D bases — `designs`, `variants`, `temporary_products`, …) are NOT Prisma models. Access them via `NocoDBClient` REST, never `$queryRaw`. Prefer the Prisma ORM over `$queryRaw` everywhere (edge WASM raw-query crashes). Details + doc links in @AGENTS.md.
