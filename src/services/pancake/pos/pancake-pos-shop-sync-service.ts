import Database from "services/database";
import PancakePosClient from "services/pancake/pos/pancake-pos-client";

export default class PancakePOSShopSyncService {
  private db: ReturnType<typeof Database.instance>;
  private client: PancakePosClient | undefined;
  private initPromise: Promise<void>;

  constructor(env: any) {
    this.db = Database.instance(env);
    this.initPromise = this.initializeClient(env);
  }

  private async initializeClient(env: any) {
    const apiKeySecret = await env.PANCAKE_POS_API_KEY_SECRET.get();
    this.client = new PancakePosClient(apiKeySecret);
  }

  async syncShops(): Promise<void> {
    await this.initPromise;

    const shops = await this.client!.getShops();
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
  }
}
