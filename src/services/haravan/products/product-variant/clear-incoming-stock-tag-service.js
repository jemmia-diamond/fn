import NocoDBClient from "services/clients/nocodb-client";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";

export default class ClearIncomingStockTagService {
  constructor(env) {
    this.env = env;
  }

  async clearIncomingStockTag(product) {
    if (!product || !product.id) return;
    const variants = product.variants || [];

    const nocodb = new NocoDBClient(this.env);
    const diamondTableId = NOCODB_TABLES.SUPPLY.DIAMONDS;

    for (const variant of variants) {
      if (!variant || !variant.id) continue;
      const qty = variant?.inventory_advance?.qty_available ?? 0;

      if (qty > 0) {
        const res = await nocodb.listRecords(diamondTableId, {
          where: `(product_id,eq,${product.id})~and(variant_id,eq,${variant.id})~and(is_incoming,eq,true)`,
          limit: 1,
          fields: "id"
        });
        const diamond = res.list?.[0] ?? null;

        if (diamond) {
          await nocodb.updateRecords(diamondTableId, {
            id: diamond.id,
            is_incoming: null
          });
        }
      }
    }
  }

  static async dequeue(batch, env) {
    const service = new ClearIncomingStockTagService(env);
    for (const message of batch.messages) {
      const body = message.body;
      await service.clearIncomingStockTag(body);
    }
  }
}
