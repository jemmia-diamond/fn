import * as Sentry from "@sentry/cloudflare";
import Database from "services/database";
import PancakePosClient from "services/pancake/pos/pancake-pos-client";

export default class PancakePOSShopSyncService {
  private db: ReturnType<typeof Database.instance>;
  private client: PancakePosClient;

  constructor(env: { PANCAKE_POS_API_KEY: string; HYPERDRIVE: unknown }) {
    this.db = Database.instance(env);
    this.client = new PancakePosClient(env.PANCAKE_POS_API_KEY);
  }

  async syncShops(): Promise<void> {
    try {
      const shops = await this.client.getShops();
      if (!shops || shops.length === 0) return;

      const updates: Promise<unknown>[] = [];
      for (const shop of shops) {
        for (const page of shop.pages ?? []) {
          if (!page.id) continue;
          updates.push(
            this.db.page.updateMany({
              where: { id: page.id },
              data: { pos_shop_id: shop.id }
            })
          );
        }
      }

      const chunkSize = 50;
      for (let i = 0; i < updates.length; i += chunkSize) {
        await Promise.all(updates.slice(i, i + chunkSize));
      }
    } catch (error) {
      Sentry.captureException(error, { tags: { service: "PancakePOSShopSync" } });
    }
  }
}
