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
    this.client = new PancakePosClient(env.PANCAKE_POS_API_KEY);
  }

  async syncShops(): Promise<void> {
    await this.initPromise;

    const pancakeShops = await this.client!.getShops();
    if (!pancakeShops.length) return;

    for (const pancakeShop of pancakeShops) {
      const accounts = pancakeShop.pages ?? [];

      for (const account of accounts) {
        if (!account.id) continue;
        await this.db.page.update({
          where: { id: account.id },
          data: { pos_shop_id: pancakeShop.id }
        });
      }
    }
  }
}
