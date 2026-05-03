import { PrismaClient } from "@prisma-cli";
import { PrismaPg } from "@prisma/adapter-pg";

let prismaInstance = null;

class Database {
  static createClient(env) {
    const connectionString = env.DATABASE_URL || env.HYPERDRIVE.connectionString;
    const adapter = new PrismaPg({ connectionString });

    return new PrismaClient({
      adapter,
      log: ["error"],
      errorFormat: "minimal"
    });
  }

  static instance(env) {
    if (!prismaInstance) {
      prismaInstance = Database.createClient(env);
    }
    return prismaInstance;
  }
}

export default Database;
