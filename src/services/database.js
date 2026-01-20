import { PrismaClient } from "@prisma-cli";
import { PrismaPg } from "@prisma/adapter-pg";

import { retryQuery } from "services/utils/retry-utils";

// Example usage:
// const db = Database.instance(c.env);
// const users = await db.$queryRaw`SELECT * FROM larksuite.users`;
class Database {
  static createClient(env) {
    // If DATABASE_URL is set, use it directly. Otherwise, use Hyperdrive.
    const connectionString = env.DATABASE_URL || env.HYPERDRIVE.connectionString;
    const adapter = new PrismaPg({ connectionString });

    const client = new PrismaClient({
      adapter,
      log: ["error"],
      errorFormat: "minimal"
    });

    return client.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            return retryQuery(async () => query(args));
          }
        },
        $queryRaw: async ({ args, query }) => {
          return retryQuery(async () => query(args));
        },
        $queryRawUnsafe: async ({ args, query }) => {
          return retryQuery(async () => query(args));
        },
        $executeRaw: async ({ args, query }) => {
          return retryQuery(async () => query(args));
        },
        $executeRawUnsafe: async ({ args, query }) => {
          return retryQuery(async () => query(args));
        }
      }
    });
  }

  static instance(env) {
    return Database.createClient(env);
  }
}

export default Database;
