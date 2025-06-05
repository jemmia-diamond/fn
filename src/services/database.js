import { PrismaClient } from "@prisma-cli";
import { PrismaNeon } from "@prisma/adapter-neon";

// Example usage:
// const db = Database.instance(c.env);
// const users = await db.$queryRaw`SELECT * FROM larksuite.users`;
class Database {
  static #instance = null;

  static instance(env) {
    if (!Database.#instance && env) {
      Database.#instance = Database.#createClient(env);
    }

    return Database.#instance;
  }

  static #createClient(env) {
    try {
      const adapter = new PrismaNeon({
        connectionString: env.DATABASE_URL
      });

      return new PrismaClient({ adapter });
    } catch (error) {
      console.error("Failed to initialize database client:", error);
      throw error;
    }
  }
}

export default Database;
