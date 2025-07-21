import { PrismaClient } from "@prisma-cli";
import { PrismaNeon } from "@prisma/adapter-neon";

// Example usage:
// const db = Database.createClient(c.env);
// const users = await db.$queryRaw`SELECT * FROM larksuite.users`;
class Database {
  static createClient(env) {
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

  // Keep this for backward compatibility, but it creates a new instance each time
  static instance(env) {
    return Database.createClient(env);
  }
}

export default Database;
