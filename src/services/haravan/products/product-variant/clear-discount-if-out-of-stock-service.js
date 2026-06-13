import NocoDBClient from "services/clients/nocodb-client";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";

export default class ClearDiscountIfOutOfStockService {
  constructor(env) {
    this.env = env;
  }

  async clearFinalDiscountValueIfOutOfStock(product) {
    if (!product || !product.id) return;
    const variants = product.variants || [];

    const nocodb = new NocoDBClient(this.env);
    const variantsTableId = NOCODB_TABLES.SUPPLY.VARIANTS;

    for (const variant of variants) {
      if (!variant || !variant.id) continue;
      const qty = variant?.inventory_advance?.qty_available ?? 0;

      if (qty === 0) {
        const records = await nocodb.listRecords(variantsTableId, {
          where: `(haravan_product_id,eq,${product.id})~and(haravan_variant_id,eq,${variant.id})~and(final_discount_price,gt,0)`,
          fields: "id"
        });

        if (records?.list?.length > 0) {
          for (const record of records.list) {
            await nocodb.updateRecords(variantsTableId, {
              id: record.id,
              final_discount_price: 0
            });
          }
        }
      }
    }
  }

  static async dequeue(batch, env) {
    const service = new ClearDiscountIfOutOfStockService(env);
    for (const message of batch.messages) {
      const body = message.body;
      await service.clearFinalDiscountValueIfOutOfStock(body);
    }
  }
}
