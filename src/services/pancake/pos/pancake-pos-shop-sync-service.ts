import * as Sentry from "@sentry/cloudflare";
import Database from "services/database";
import PancakePosClient from "services/pancake/pos/pancake-pos-client";

export default class PancakePOSShopSyncService {
  private db: ReturnType<typeof Database.instance>;
  private client: PancakePosClient;

  constructor(env: any) {
    this.db = Database.instance(env);
    this.client = new PancakePosClient(env.PANCAKE_POS_API_KEY_SECRET);
  }

  async syncShops(): Promise<void> {
    try {
      const shops = await this.client.getShops();
      if (!shops || shops.length === 0) return;

      for (const shop of shops) {
        for (const page of shop.pages ?? []) {
          if (!page.id) continue;
          await this.db.page.update({
            where: { id: page.id },
            data: { pos_shop_id: shop.id }
          });
        }
      }
    } catch (error) {
      Sentry.captureException(error, { tags: { service: "PancakePOSShopSyncService" } });
    }
  }
}
