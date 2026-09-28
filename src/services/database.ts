import { PrismaClient } from "@prisma-cli";
import { PrismaPg } from "@prisma/adapter-pg";

// Example usage:
// const db = Database.instance(c.env);
// const users = await db.$queryRaw`SELECT * FROM larksuite.users`;

// One client — and therefore one connection pool — per connection string,
// reused for the lifetime of the isolate. Building a client per call opens a
// pool that is never closed, which exhausts connections under load and makes
// Prisma fail with "Unable to start a transaction in the given time".
const clients = new Map<string, PrismaClient>();

class Database {
  // If DATABASE_URL is set, use it directly. Otherwise, use Hyperdrive.
  static connectionString(env: any) {
    return env.DATABASE_URL || env.HYPERDRIVE.connectionString;
  }

  static createClient(env: any) {
    const adapter = new PrismaPg({
      connectionString: Database.connectionString(env)
    });

    return new PrismaClient({
      adapter,
      log: ["error"],
      errorFormat: "minimal"
    });
  }

  static instance(env) {
    const connectionString = Database.connectionString(env);
    let client = clients.get(connectionString);

    if (!client) {
      client = Database.createClient(env);
      clients.set(connectionString, client);
    }

    return client;
  }
}

export default Database;
