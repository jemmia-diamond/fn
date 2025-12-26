import * as Sentry from "@sentry/cloudflare";
import { WorkplaceClient } from "services/clients/workplace-client";

export default class ProductVariantService {
  constructor(env) {
    this.env = env;
  }

  async clearIncomingStockTag(product) {
    const variants = product.variants || [];

    const WORKPLACE_BASE_ID = this.env.NOCODB_SUPPLY_BASE_ID;
    const workplaceClient = await WorkplaceClient.initialize(this.env, WORKPLACE_BASE_ID);

    for (const variant of variants) {
      const qty = variant?.inventory_advance?.qty_available ?? 0;

      if (qty > 0) {
        const diamond = await workplaceClient.diamonds.findOne({
          where: `(product_id,eq,${product.id})~and(variant_id,eq,${variant.id})~and(is_incoming,is,true)`
        });

        if (diamond) {
          await workplaceClient.diamonds.update(diamond.id, {
            is_incoming: null
          });
        }
      }
    }
  }

  async clearFinalDiscountValueIfOutOfStock(product) {
    const variants = product.variants || [];

    const WORKPLACE_BASE_ID = this.env.NOCODB_SUPPLY_BASE_ID;
    const workplaceClient = await WorkplaceClient.initialize(this.env, WORKPLACE_BASE_ID);

    for (const variant of variants) {
      const qty = variant?.inventory_advance?.qty_available ?? 0;

      if (qty === 0) {
        const records = await workplaceClient.variants.list({
          where: `(haravan_product_id,eq,${product.id})~and(haravan_variant_id,eq,${variant.id})~and(final_discount_price,gt,0)`
        });

        if (records?.list?.length > 0) {
          const updates = records.list.map(record => ({
            id: record.id,
            final_discount_price: 0
          }));

          await workplaceClient.variants.bulkUpdate(updates);
        }
      }
    }
  }

  static async dequeueProductQueue(batch, env) {
    const service = new ProductVariantService(env);
    for (const message of batch.messages) {
      try {
        const body = message.body;

        await service.clearIncomingStockTag(body);
        await service.clearFinalDiscountValueIfOutOfStock(body);
      }
      catch (error) {
        Sentry.captureException(error);
      }
    }
  }
}
