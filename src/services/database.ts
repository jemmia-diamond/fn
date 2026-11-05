import { AsyncLocalStorage } from "node:async_hooks";

import { PrismaClient } from "@prisma-cli";
import { PrismaPg } from "@prisma/adapter-pg";

// Example usage:
// const db = Database.instance(c.env);
// const users = await db.$queryRaw`SELECT * FROM larksuite.users`;

type ClientScope = { clients: Set<PrismaClient> };

// Per-invocation registry of the clients `instance` hands out. Prisma leaks
// WASM memory for every client that is never disconnected; once the wasm heap
// has grown enough, the isolate throws `Invalid array buffer length` on every
// subsequent query until it is recycled. See prisma/prisma#28012.
const clientScope = new AsyncLocalStorage<ClientScope>();

class Database {
  static createClient(env: any) {
    // If DATABASE_URL is set, use it directly. Otherwise, use Hyperdrive.
    const connectionString =
      env.DATABASE_URL || env.HYPERDRIVE.connectionString;
    const adapter = new PrismaPg({ connectionString });

    return new PrismaClient({
      adapter,
      log: ["error"],
      errorFormat: "minimal"
    });
  }

  static instance(env) {
    const client = Database.createClient(env);
    // Registered only inside `withScope`; every other caller keeps ownership
    // of its own client, exactly as before.
    clientScope.getStore()?.clients.add(client);
    return client;
  }

  /**
   * Runs `fn` with a fresh registry and disconnects every client created
   * during it once `fn` settles.
   *
   * Only safe where nothing outlives `fn`. Work deferred with
   * `ctx.waitUntil` keeps running after the handler returns and would lose
   * its client, so those entry points are not wrapped.
   */
  static async withScope<T>(fn: () => Promise<T>): Promise<T> {
    const scope: ClientScope = { clients: new Set() };

    try {
      return await clientScope.run(scope, fn);
    } finally {
      // Collected with forEach rather than spread: the project sets no
      // `target`, so iterating a Set directly trips TS downlevelIteration.
      const disconnects: Promise<void>[] = [];
      scope.clients.forEach((client) => disconnects.push(client.$disconnect()));

      // Never let a failed disconnect mask the original outcome.
      await Promise.allSettled(disconnects);
    }
  }
}

export default Database;
