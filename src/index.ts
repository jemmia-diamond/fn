import queueHandler from './core/queue-handler.js';
import scheduleHandler from './core/schedule-handler.js';

// @ts-ignore
import v2App from '../packages/v2/src/index.js'
// @ts-ignore
import { DebounceDurableObject } from "../packages/v2/src/durable-objects";
import exampleApp from './example/example.app.js';
import { App } from './core/types/app.type.js';

const app = new App({
    path: '/',
    apps: [
        exampleApp,
        { path: '/', honoApp: v2App }
    ]
})

// Cron trigger and Queue Integrations
export default {
  fetch: app.fetch,
  queue: queueHandler.queue,
  scheduled: scheduleHandler.scheduled
};

// Export Durable Object classes
export { DebounceDurableObject };
