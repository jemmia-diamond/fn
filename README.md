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
pnpm prisma generate

# Create and apply migrations
pnpm prisma migrate dev

# Open Prisma Studio (database browser)
pnpm prisma studio

# Push schema changes (prototyping)
pnpm prisma db push

# Pull schema from database
pnpm prisma db pull
```

#### Migration Workflow

1. **Sync your local/dev database:**
   ```bash
   pnpm prisma migrate deploy
   ```

2. **After modifying models:**
   ```bash
   pnpm prisma migrate dev --name <MIGRATION_NAME>
   # Example: pnpm prisma migrate dev --name add_user_table
   ```

3. **Generate Prisma Client:**
   ```bash
   pnpm prisma generate
   ```

#### Schema Organization

```
prisma/
├── models/
│   ├── workplace.prisma    # Main schema (32 models)
│   ├── ecommerce.prisma    # E-commerce models
│   ├── inventory.prisma    # Inventory models
│   └── ... (21 files total)
├── schema.prisma         # Generator & datasource config
└── migrations/           # Auto-generated migrations
```

> [!IMPORTANT]
> Prisma manages migrations via the `_prisma_migrations` table. Do not modify this table in production.

This will start a local development server using Wrangler. Or in the case you want to test Cron triggers using Wrangler.

```bash
pnpm run dev --test-scheduled

curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"
```

## Environment Variables & Secrets

Environment variables are stored in `.dev.vars` for local development (not committed to git). Use `.dev.vars.example` as a reference for the required keys.

### Syncing secrets from Infisical

This project uses a **self-hosted [Infisical](https://infisical.jemmia.vn)** instance to manage secrets.

Some secrets — particularly Pancake Page Access Tokens (`PANCAKE_PATS_CONFIG_*`) — rotate automatically at midnight and are stored in Infisical under `/commons/public`. After they rotate, you need to pull the latest values into your `.dev.vars`.

#### Prerequisites

Install the Infisical CLI. **Note:** You must install version `0.43.45` specifically to remain compatible with our self-hosted instance's API version.

```bash
brew install infisical/get-cli/infisical@0.43.45
```

#### Pull rotated PAT secrets into `.dev.vars`

Run the fetch script — it does a **smart merge**: only the fetched keys are updated; everything else in `.dev.vars` is left untouched.

> **Note on tooling:** The script automatically tries to use the Infisical CLI if you installed it. If not, it gracefully falls back to using `curl` and `jq`. You don't have to do anything differently!

```bash
# 1. Ask your admin for the PUBLIC_INFISICAL_TOKEN and add it to .dev.vars:
#    PUBLIC_INFISICAL_TOKEN='st.xxxxxxxxxx...'
# 2. Make the script executable and run it:
chmod +x fetch_dev_key.sh
./fetch_dev_key.sh
```

The script will print each key that was updated or added:
```
Updated: PANCAKE_PATS_CONFIG_1
Updated: PANCAKE_PATS_CONFIG_2
Updated: PANCAKE_PATS_CONFIG_3
Done. .dev.vars updated.
```

> [!NOTE]
> If it stops working (404 or auth error from Infisical), the token may have been revoked. Ask your admin to generate a new one from **https://infisical.jemmia.vn → Project Settings → Service Tokens** and update your `.dev.vars`.

#### How Pancake PATs are generated

The `Pancake.TokenRefresherService` runs daily at midnight (cron `0 17 * * *`). It:
1. Generates fresh Page Access Tokens for all active Pancake pages
2. Chunks them into groups of 20 and stores them as `PANCAKE_PATS_CONFIG_1`, `PANCAKE_PATS_CONFIG_2`, etc. in Infisical under `/commons/public`

After this runs in production, pull the new values locally with `./fetch_dev_key.sh`.



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

## AI Agents / Skills

This project includes AI agent skills in the `.agents/skills` directory to help with development and debugging.

### Sentry Investigator

To use the `sentry-investigator` skill for automated error debugging, your AI agent needs a Sentry authentication token.

1. Go to the Sentry dashboard and navigate to **Settings > Account > API > Auth Tokens**.
2. Click **Create New Token** and ensure it has `project:read`, `event:read`, and `issue:read` permissions.
3. Export the token in your terminal environment before running your AI agent:
   ```bash
   export SENTRY_AUTH_TOKEN="your_token_here"
   ```
