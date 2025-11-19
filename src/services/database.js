import { PrismaClient } from "@prisma-cli";
import { PrismaPg } from "@prisma/adapter-pg";

// Example usage:
// const db = Database.instance(c.env);
// const users = await db.$queryRaw`SELECT * FROM larksuite.users`;
class Database {
  static createClient(env) {
    // If DATABASE_URL is set, use it directly.
    // Otherwise, use Hyperdrive.
    const connectionString = env.DATABASE_URL || env.HYPERDRIVE.connectionString;
    const adapter = new PrismaPg({ connectionString });

    return new PrismaClient({
      adapter,
      log: ["error"],
      errorFormat: "minimal"
    });
  }

  static instance(env) {
    return Database.createClient(env);
  }
}

export default Database;
