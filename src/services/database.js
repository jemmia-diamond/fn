import { PrismaClient } from "@prisma-cli";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neon } from "@neondatabase/serverless";

// Example usage:
// const db = Database.createClient(c.env);
// const users = await db.$queryRaw`SELECT * FROM larksuite.users`;
class Database {
  static createClient(env) {
    try {
      const adapter = new PrismaNeon({
        connectionString: env.DATABASE_URL,
        poolQueryViaFetch: true
      });

      return new PrismaClient({
        adapter,
        log: ["error"],
        errorFormat: "minimal"
      });
    } catch (error) {
      console.error("Failed to initialize database client:", error);
      throw error;
    }
  }

  // Create new instance each time for CF Workers compatibility
  static instance(env, adapter = null) {
    if (adapter == "neon") {
      const sql = neon(env.DATABASE_URL);
      return {
        $queryRaw: (strings, ...values) => {
          const rawValue = values[0];
          return sql.query(rawValue.text);
        }
      };
    }

    return Database.createClient(env);
  }
}

export default Database;
