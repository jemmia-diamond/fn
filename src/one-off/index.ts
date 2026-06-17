import backfillPancakePosOrderSync from "src/one-off/20260617045927_backfill_pancake_pos_order_sync";

export const ONE_OFF_SCRIPTS: Array<{ name: string; handler: (env: any) => Promise<void> }> = [
  { name: "20260617045927_backfill_pancake_pos_order_sync", handler: backfillPancakePosOrderSync }
];
