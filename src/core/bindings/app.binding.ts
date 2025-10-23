/**
 * Binding configs for app
 */
export type AppBindings = {
  SENTRY_DSN: string;
  ENVIRONMENT?: string;
  SENTRY_TRACE_SAMPLE_RATE?: number;
  SENTRY_PROFILE_SAMPLE_RATE?: number;
  DATABASE_URL: string;
}
