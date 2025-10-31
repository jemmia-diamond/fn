import queueHandler from './core/queue-handler.js';
import scheduleHandler from './core/schedule-handler.js';
import * as Sentry from '@sentry/node';
import v2App from '../packages/v2/src/index.js';
import { DebounceDurableObject } from '../packages/v2/src/durable-objects';
import exampleApp from './example/example.app.js';
import { App } from './core/types/app.type.js';
import { ExecutionContext } from 'hono';
import { AppBindings } from 'core/bindings/app.binding.js';
import { DatabaseClient } from 'core/clients/database.client.js';

const app = new App<{ Bindings: AppBindings }>({
  path: '/',
  apps: [exampleApp, { path: '/', honoApp: v2App }],
});

let sentryInitialized = false;
let databaseInitialized = false;

// Cron trigger and Queue Integrations
export default {
  fetch: (req: Request, env: AppBindings, ctx: ExecutionContext) => {
    if (!sentryInitialized && env.SENTRY_DSN) {
      // Dynamic import when in production - mac os local will fail when import outside
      // import("@sentry/profiling-node").then(({ nodeProfilingIntegration }) => {
      //   Sentry.init({
      //     dsn: env.SENTRY_DSN,
      //     sendDefaultPii: true,
      //     integrations: [
      //       nodeProfilingIntegration()
      //     ],
      //     tracesSampleRate: env.SENTRY_TRACE_SAMPLE_RATE ?? 0.2,
      //     profilesSampleRate: env.SENTRY_PROFILE_SAMPLE_RATE ?? 0.1,
      //     enableLogs: true,
      //   });
      // });
      // sentryInitialized = true;
    }

    if (!databaseInitialized) {
      DatabaseClient.initialize(env);
      databaseInitialized = true;
    }

    return app.fetch(req, env, ctx);
  },
  queue: queueHandler.queue,
  scheduled: scheduleHandler.scheduled,
};

// Export Durable Object classes
export { DebounceDurableObject };
