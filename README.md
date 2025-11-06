# FN - Hono-based Cloudflare Workers Function

A serverless function project built with Cloudflare Workers.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [pnpm](https://pnpm.io/) package manager

## Installation

### Install pnpm

If you don't have pnpm installed, you can install it using:

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

Alternatively, visit the [official pnpm documentation](https://pnpm.io/installation) for other installation methods.

### Install dependencies

```bash
pnpm install
```

## Development

Start the development server with:

```bash
pnpm run dev
```

### Prisma ORM

This project uses a **multi-file Prisma schema** organized by PostgreSQL schemas for better maintainability. The schema is split into 21 files in `prisma/schema/`.

#### Common Commands

```bash
# Generate Prisma Client
pnpm prisma:generate

# Create and apply migrations
pnpm prisma:migrate

# Open Prisma Studio (database browser)
pnpm prisma:studio

# Push schema changes (prototyping)
pnpm prisma:push

# Pull schema from database
pnpm prisma:pull
```

#### Migration Workflow

1. **Sync your local/dev database:**
   ```bash
   pnpm prisma migrate deploy --schema=prisma/schema
   ```

2. **After modifying models:**
   ```bash
   pnpm prisma:migrate --name <MIGRATION_NAME>
   # Example: pnpm prisma:migrate --name add_user_table
   ```

3. **Generate Prisma Client:**
   ```bash
   pnpm prisma:generate
   ```

#### Schema Organization

```
prisma/
├── schema/
│   ├── base.prisma         # Generator & datasource config
│   ├── workplace.prisma    # Main schema (32 models)
│   ├── ecommerce.prisma    # E-commerce models
│   ├── inventory.prisma    # Inventory models
│   └── ... (21 files total)
└── migrations/             # Auto-generated migrations
```

> [!IMPORTANT]
> Prisma manages migrations via the `_prisma_migrations` table. Do not modify this table in production.

This will start a local development server using Wrangler. Or in the case you want to test Cron triggers using Wrangler.

```bash
pnpm run dev --test-scheduled

curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"
```

## Adding New Features

### Project Structure

- `src/controllers/` - Contains all controller files organized by namespaces
- `src/routes/` - Contains route definitions
- `src/services/` - Contains reusable business logic and utilities
- `src/index.js` - Main worker entry point with Highlight integration
- `public/` - Static assets directory
- `wrangler.jsonc` - Cloudflare Workers configuration

### Code Organization

When building features:
- Keep controllers focused on request handling and response formatting
- Extract reusable business logic and utilities to files under the `services` folder
- Follow a consistent naming pattern for related files

### Adding New Controllers

1. Create a new controller file in `src/controllers/your-namespace/`
2. Follow the existing controller pattern and RESTful actions:

```javascript
export class YourController {
  static async index(ctx) {
    // List all resources
    return ctx.json({ items: [] });
  }

  static async show(ctx) {
    // Show a specific resource
    const id = ctx.req.param("id");
    return ctx.json({});
  }

  static async create(ctx) {
    // Create a new resource
    const body = await ctx.req.json();
    return ctx.json({});
  }

  static async update(ctx) {
    // Update a specific resource
    const id = ctx.req.param("id")
    const body = await ctx.req.json()
    return ctx.json({});
  }

  static async destroy(ctx) {
    // Delete a specific resource
    const id = ctx.req.param("id");
    return ctx.json({});
  }
}
```

### Adding New Routes

1. Add your routes in `src/routes/index.js` following RESTful conventions:

```javascript
import { YourController } from "../controllers/your-namespace/your-controller"

// RESTful routes
app.get("/resources", YourController.index)          // List all
app.get("/resources/:id", YourController.show)       // Show one
app.post("/resources", YourController.create)        // Create
app.put("/resources/:id", YourController.update)     // Update
app.delete("/resources/:id", YourController.destroy) // Delete
```

## Contributing

1. Create a new branch for your feature
2. Make your changes following the project structure
3. Code quality check
- Before each commit, ESLint will run automatically
- If linting fails, please run this command or manually fix the lint errors:  
  ```bash
  pnpm run format
  ```
4. Commit your changes:
- Instead of writing commit messages manually, run:
  ```bash
  git commit
  ```
- This will open an interactive prompt where you select the commit type (feat, fix, docs, …), scope, and description.
5. Push your changes and open a Pull Request

## Deployment

Push to Github to trigger the deployment process.

## Technologies

- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless platform
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) - CLI for Cloudflare Workers
- [Hono](https://hono.dev/) - Lightweight web framework
- [Sentry](https://sentry.io/) - Error tracking

