import backfillPancakePosOrderSync from "src/one-off/20260617045927_backfill_pancake_pos_order_sync";
import updateWeddingRingPrices from "src/one-off/20260721045927_update_wedding_ring_prices";

export const ONE_OFF_SCRIPTS: Array<{ name: string; handler: (env: any) => Promise<void> }> = [
  { name: "20260617045927_backfill_pancake_pos_order_sync", handler: backfillPancakePosOrderSync },
  { name: "20260721045927_update_wedding_ring_prices", handler: updateWeddingRingPrices }
];
