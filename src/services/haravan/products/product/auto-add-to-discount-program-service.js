import * as Sentry from "@sentry/cloudflare";
import HaravanAPI from "services/clients/haravan-client";
import { HARAVAN_TOPIC } from "services/ecommerce/enum";
import { BadRequestException } from "src/exception/exceptions";

export default class AutoAddToDiscountProgramService {
  constructor(env) {
    this.env = env;
  }

  static async dequeueProductQueue(batch, env) {
    const service = new AutoAddToDiscountProgramService(env);
    for (const message of batch.messages) {
      try {
        const body = message.body;
        const haravanTopic = body.haravan_topic;

        if (haravanTopic === HARAVAN_TOPIC.PRODUCT_CREATED) {
          await service.processProduct(body);
        }
      }
      catch (error) {
        Sentry.captureException(error);
      }
    }
  }

  async processProduct(product) {
    const variants = product.variants || [];

    // Check for Diamond
    const isDiamond = variants.length > 0 && variants.every(variant => {
      const sku = variant.sku || "";
      const title = variant.title || "";
      const skuParts = sku.split("-");
      const isSkuValid = skuParts.length === 2 && skuParts[1].startsWith("GIA");
      return isSkuValid || title.startsWith("GIA");
    });

    if (isDiamond) {
      const DIAMOND_COLLECTION_ID = this.env.DEFAULT_HARAVAN_DIAMOND_DISCOUNT_COLLECTION_ID;
      await this.addCollect(product.id, DIAMOND_COLLECTION_ID);
    } else {
      // Check for Jewelry
      const isJewelry = variants.length > 0 && variants.some(variant => {
        const sku = variant.sku || "";
        return sku.length === 21;
      });

      if (isJewelry) {
        const JEWELRY_COLLECTION_ID = this.env.DEFAULT_HARAVAN_JEWELRY_DISCOUNT_COLLECTION_ID;
        await this.addCollect(product.id, JEWELRY_COLLECTION_ID);
      }
    }
  }

  async addCollect(productId, collectionId) {
    const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();
    if (!HRV_API_KEY) {
      throw new BadRequestException("Haravan API credentials or base URL are not configured in the environment.");
    }

    const hrvClient = new HaravanAPI(HRV_API_KEY);

    try {
      await hrvClient.collect.createCollect({
        "product_id": productId,
        "collection_id": collectionId
      });
    } catch (error) {
      Sentry.captureException(error);
    }
  }
}
