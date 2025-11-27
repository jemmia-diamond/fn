import * as Sentry from "@sentry/cloudflare";
import Database from "services/database";

export default class ProductVariantService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  async clearIncomingStockTag(product) {
    const variants = product.variants || [];

    for (const variant of variants) {
      const qty = variant.qty_available ?? 0;

      if (qty > 0) {
        await this.db.$executeRaw`
          UPDATE "workplace"."diamonds"
          SET "is_incoming" = NULL
          WHERE "product_id" = ${product.id}
          AND "variant_id" = ${variant.id}
          AND "is_incoming" IS TRUE
        `;
      }
    }
  }

  static async dequeueProductQueue(batch, env) {
    const service = new ProductVariantService(env);
    for (const message of batch.messages) {
      try {
        const body = message.body;

        await service.clearIncomingStockTag(body);
      }
      catch (error) {
        Sentry.captureException(error);
      }
    }
  }
}
