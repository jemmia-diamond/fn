import { PrismaClient } from "@prisma-cli";
import { withAccelerate } from "@prisma/extension-accelerate";

// Example usage:
// const db = Database.createClient(c.env);
// const users = await db.$queryRaw`SELECT * FROM larksuite.users`;
class Database {
  static createClient(env) {
    try {
      // Use Prisma Accelerate for Cloudflare Workers
      const prisma = new PrismaClient({
        datasourceUrl: env.DATABASE_URL
      }).$extends(withAccelerate());

      return prisma;
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
