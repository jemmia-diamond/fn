import { PrismaClient } from "@prisma-cli";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig, Pool } from "@neondatabase/serverless";

// Example usage:
// const db = Database.instance(c.env);
// const users = await db.$queryRaw`SELECT * FROM larksuite.users`;
neonConfig.webSocketConstructor = WebSocket;
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
  static async withRetry(fn, maxRetries = 3) {
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

        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, i)));
      }
    }
    throw lastError;
  }

  // Create new instance each time for CF Workers compatibility
  static instance(env, adapter = null) {
    if (adapter === "neon") {
      const pool = new Pool({ connectionString: env.DATABASE_URL });

      return {
        $queryRaw: async (strings, ...values) => {
          const raw = values[0];

          if (raw && typeof raw === "object") {
            const text = raw.text || raw.sql;
            const params = raw.values || [];
            const result = await Database.withRetry(() => pool.query(text, params));
            return result.rows;
          } else {
            let text = "";
            for (let i = 0; i < strings.length; i++) {
              text += strings[i];
              if (i < values.length) text += `$${i + 1}`;
            }
            const params = values;

            const exec = () => pool.query(text, params);
            const result = await Database.withRetry(exec);
            await pool.end();
            return result.rows;
          }
        }
      };
    }

    return Database.createClient(env);
  }
}

export default Database;
