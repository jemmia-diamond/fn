import * as Sentry from "@sentry/cloudflare";
import { WorkplaceClient } from "services/clients/workplace-client";
import { HARAVAN_TOPIC } from "services/ecommerce/enum";
import { SKU_LENGTH } from "services/haravan/products/product-variant/constant";

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

        if (haravanTopic === HARAVAN_TOPIC.PRODUCT_UPDATE) {
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
      await this.addToDiamondCollection(product.id);
    } else {
      // Check for Jewelry
      const isJewelry = variants.length > 0 && variants.some(variant => {
        const sku = variant.sku || "";
        return sku.length === SKU_LENGTH.JEWELRY;
      });

      if (isJewelry) {
        await this.addToJewelryCollection(product.id);
      }
    }
  }

  async addToDiamondCollection(haravanProductId) {
    try {
      const workplaceClient = await WorkplaceClient.initialize(this.env, this.env.NOCODB_SUPPLY_BASE_ID);

      const diamondsQuery = await workplaceClient.diamonds.list({
        where: `(product_id,eq,${haravanProductId})`
      });
      const diamonds = diamondsQuery.list || [];

      if (!diamonds || diamonds.length === 0) {
        return;
      }

      const DIAMOND_COLLECTION_ID = this.env.DEFAULT_HARAVAN_DIAMOND_DISCOUNT_COLLECTION_ID;

      for (const diamond of diamonds) {
        try {
          const existing = await workplaceClient.diamondHaravanCollections.list({
            where: `(diamond_id,eq,${diamond.id})~and(haravan_collection_id,eq,${DIAMOND_COLLECTION_ID})`
          });

          if (existing.list?.length === 0) {
            await workplaceClient.diamondHaravanCollections.create({
              diamond_id: diamond.id,
              haravan_collection_id: DIAMOND_COLLECTION_ID
            });
          }
        } catch (error) {
          const errorData = error.response?.data;
          if (errorData?.code === "23505" || errorData?.message === "This record already exists.") {
            continue;
          }
          throw error;
        }
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  async addToJewelryCollection(haravanProductId) {
    try {
      const workplaceClient = await WorkplaceClient.initialize(this.env, this.env.NOCODB_SUPPLY_BASE_ID);

      const productsQuery = await workplaceClient.jewelries.list({
        where: `(haravan_product_id,eq,${haravanProductId})`,
        limit: 1
      });

      const product = productsQuery.list?.[0];

      if (!product) {
        return;
      }

      const JEWELRY_COLLECTION_ID = this.env.DEFAULT_HARAVAN_JEWELRY_DISCOUNT_COLLECTION_ID;

      try {
        const existing = await workplaceClient.jewelryHaravanCollections.list({
          where: `(products_id,eq,${product.id})~and(haravan_collections_id,eq,${JEWELRY_COLLECTION_ID})`
        });

        if (existing.list?.length === 0) {
          await workplaceClient.jewelryHaravanCollections.create({
            products_id: product.id,
            haravan_collections_id: JEWELRY_COLLECTION_ID
          });
        }
      } catch (error) {
        const errorData = error.response?.data;
        if (errorData?.code === "23505" || errorData?.message === "This record already exists.") {
          return;
        }
        throw error;
      }

    } catch (error) {
      Sentry.captureException(error);
    }
  }
}
