import syncPancakePosShops from "src/one-off/20260511000000_sync_pancake_pos_shops";
import backfillPageCustomerPhoneNormalize from "src/one-off/20260513000000_backfill_page_customer_phone_normalize";

export const ONE_OFF_SCRIPTS: Array<{ name: string; handler: (env: any) => Promise<void> }> = [
  { name: "20260511000001_sync_pancake_pos_shops", handler: syncPancakePosShops },
  { name: "20260513000000_backfill_page_customer_phone_normalize", handler: backfillPageCustomerPhoneNormalize }
];