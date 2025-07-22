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

## Prisma Multiple Schema Files

This project uses multiple Prisma schema files for better organization:

- Place your `.prisma` files in `prisma/schema/` directory
- The main `schema.prisma` contains generator and datasource configuration
- Create separate files for different model groups (e.g., `haravan.prisma`, `pancake.prisma`)
- Models can reference each other across files without imports
- Run pull/push to migrate schema database.
```bash
# Pull the current database schema into your Prisma schema files
pnpx prisma db pull 

# Push your Prisma schema changes to the database (apply schema changes)
pnpx prisma db push
```
- Build Prisma with:
```bash
pnpx prisma generate
```

### Important Notes

- **Model names must be unique** across all schema files
- Use `@@map()` to map Prisma models to actual database table names when needed
- For detailed examples of model mapping, see `erpnext.prisma`


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
3. Run ESLint locally before submitting your PR:
```bash
pnpm run lint
```
4. Push your changes and open a Pull Request

## Deployment

Push to Github to trigger the deployment process.

## Technologies

- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless platform
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) - CLI for Cloudflare Workers
- [Hono](https://hono.dev/) - Lightweight web framework
- [Sentry](https://sentry.io/) - Error tracking

