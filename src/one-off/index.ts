import syncPancakePosShops from "src/one-off/20260511000000_sync_pancake_pos_shops";
import backfillPancakePosOrderSync from "src/one-off/20260616000000_backfill_pancake_pos_order_sync";

export const ONE_OFF_SCRIPTS: Array<{ name: string; handler: (env: any) => Promise<void> }> = [
  { name: "20260511000001_sync_pancake_pos_shops", handler: syncPancakePosShops },
  { name: "20260616000000_backfill_pancake_pos_order_sync", handler: backfillPancakePosOrderSync }
];
