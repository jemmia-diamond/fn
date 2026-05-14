import PancakePOSShopSyncService from "services/pancake/pos/pancake-pos-shop-sync-service";

export default async function syncPancakePosShops(env: any): Promise<void> {
  await new PancakePOSShopSyncService(env).syncShops();
}
