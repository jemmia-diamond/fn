import { PrismaNeon } from '@prisma/adapter-neon';
import { AppBindings } from 'core/bindings/app.binding';
import { PrismaClient } from 'prisma/schema/generated/client/client';

export class DatabaseClient {
  private static _client: PrismaClient;

  public static initialize(env: AppBindings) {
    const adapter = new PrismaNeon({
      connectionString: env.DATABASE_URL,
    });

    this._client = new PrismaClient({
      adapter,
      log: ['error'],
      errorFormat: 'minimal',
    });

    return this._client;
  }

  public static get client() {
    return this._client;
  }
}
