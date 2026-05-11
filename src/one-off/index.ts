import backfillPancakePosOrders from "src/one-off/20260511000000_backfill_pancake_pos_orders";

export const ONE_OFF_SCRIPTS: Array<{ name: string; handler: (env: any) => Promise<void> }> = [
  { name: "20260511000000_backfill_pancake_pos_orders", handler: backfillPancakePosOrders }
];
