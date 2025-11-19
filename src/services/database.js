import { PrismaClient } from "@prisma-cli";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Example usage:
// const db = Database.instance(c.env);
// const users = await db.$queryRaw`SELECT * FROM larksuite.users`;
if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}
neonConfig.poolQueryViaFetch = true;

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
  static async withRetry(fn, maxRetries = 5) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        const isRetryable =
          error.message?.includes("status 520") ||
          error.message?.includes("status 503") ||
          error.message?.includes("Connection terminated unexpectedly");

        if (!isRetryable || i === maxRetries - 1) {
          throw error;
        }

        // Exponential backoff: 200ms, 400ms, 800ms, 1600ms, 3200ms
        const delay = 200 * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw lastError;
  }

  static instance(env, adapter = null) {
    if (adapter === "neon") {
      const sql = neon(env.DATABASE_URL, {
        fetchOptions: {
          priority: "high"
        }
      });

      return {
        $queryRaw: (strings, ...values) => {
          return Database.withRetry(async () => {
            const rawValue = values[0];
            if (rawValue?.text) {
              return await sql.query(rawValue.text);
            }
            return await sql(strings, ...values);
          });
        }
      };
    }

    return Database.createClient(env);
  }
}

export default Database;
