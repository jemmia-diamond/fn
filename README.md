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

This will start a local development server using Wrangler.

## Deployment

Push to Github to trigger the deployment process.

## Project Structure

- `src/index.js` - Main worker entry point with Highlight integration
- `public/` - Static assets directory
- `wrangler.jsonc` - Cloudflare Workers configuration

## Technologies

- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless platform
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) - CLI for Cloudflare Workers
- [Hono](https://hono.dev/) - Lightweight web framework
- [Sentry](https://sentry.io/) - Error tracking
