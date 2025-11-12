import { PrismaClient } from "@prisma-cli";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neon, neonConfig } from "@neondatabase/serverless";

neonConfig.fetchConnectionCache = true;

// Example usage:
// const db = Database.instance(c.env);
// const users = await db.$queryRaw`SELECT * FROM larksuite.users`;
class Database {
  static createClient(env) {
    const adapter = new PrismaNeon({
      connectionString: env.DATABASE_URL,
      poolQueryViaFetch: true
    });

    return new PrismaClient({
      adapter,
      log: ["error"],
      errorFormat: "minimal"
    });
  }

  // Retry helper for transient errors
  static async withRetry(fn, maxRetries = 3) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        const isRetryable = error.message?.includes("status 520") ||
                           error.message?.includes("status 503") ||
                           error.message?.includes("Connection terminated unexpectedly");

        if (!isRetryable || i === maxRetries - 1) {
          throw error;
        }

        const base = 150;
        const backoff = base * Math.pow(2, i);
        const jitter = Math.floor(Math.random() * 100);
        await new Promise(resolve => setTimeout(resolve, backoff + jitter));
      }
    }
    throw lastError;
  }

  // Create new instance each time for CF Workers compatibility
  static instance(env, adapter = null) {
    if (adapter == "neon") {
      const sql = neon(env.DATABASE_URL);
      return {
        $queryRaw: (strings, ...values) => {
          const rawValue = values[0];
          const query = rawValue.text ? sql.query(rawValue.text) : sql(strings, ...values);

          // Wrap with retry logic
          return Database.withRetry(() => query);
        }
      };
    }

    return Database.createClient(env);
  }
}

export default Database;
