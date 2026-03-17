import * as Sentry from "@sentry/cloudflare";
import NocoDBClient from "services/clients/nocodb-client";
import { HARAVAN_TOPIC } from "services/ecommerce/enum";
import { SKU_LENGTH, HRV_PRODUCT_TYPE } from "services/haravan/products/product-variant/constant";

const EXCLUDED_COLLECTION_TITLES = [
  "Lotus Essence",
  "Lotus Brilliance",
  "Lotus Elegance",
  "Sen Quý Hiển",
  "Vũ Khúc Thiên Phượng",
  "BRILLIANCE GLORY",
  "Ngũ Phúc",
  "Mai - The Golden Bloom",
  "Đào - Cultivated Grace"
];

export default class AutoAddToDiscountProgramService {
  static DIAMONDS_TABLE = "m4qggn3vyz5qyqi";
  static JEWELRIES_TABLE = "mhx7y71vqz64ydn";
  static DIAMOND_HARAVAN_COLLECTIONS_TABLE = "mxu3rae3quofz6n";
  static JEWELRY_HARAVAN_COLLECTIONS_TABLE = "mvhqmb8qzxl8y7z";
  static HARAVAN_COLLECTIONS_TABLE = "mpgeruya41k3zcg";
  static DESIGNS_TABLE = "m1g1pwq2zmk2scc";
  static COLLECTIONS_TABLE = "m861dlk1gn7ws8x";

  constructor(env) {
    this.env = env;
  }

  static async dequeueProductQueue(batch, env) {
    const service = new AutoAddToDiscountProgramService(env);
    for (const message of batch.messages) {
      try {
        const body = message.body;
        const haravanTopic = body.haravan_topic;

        if (haravanTopic === HARAVAN_TOPIC.PRODUCT_UPDATE || haravanTopic === HARAVAN_TOPIC.PRODUCT_CREATED) {
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
    const isDiamond = variants.length > 0 && variants.some(variant => {
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

      if (isJewelry && product.product_type.trim() !== HRV_PRODUCT_TYPE.PLAIN_CHAIN) {
        await this.addToJewelryCollection(product.id);
      }
    }
  }

  async addToDiamondCollection(haravanProductId) {
    try {
      const nocodb = new NocoDBClient(this.env);

      const diamondsQuery = await nocodb.listRecords(AutoAddToDiscountProgramService.DIAMONDS_TABLE, {
        where: `(product_id,eq,${haravanProductId})`
      });
      const diamonds = diamondsQuery.list || [];

      if (!diamonds || diamonds.length === 0) {
        return;
      }

      const DIAMOND_COLLECTION_ID = this.env.DEFAULT_HARAVAN_DIAMOND_DISCOUNT_COLLECTION_ID;
      const diamondHaravanCollectionsTableId = AutoAddToDiscountProgramService.DIAMOND_HARAVAN_COLLECTIONS_TABLE;

      for (const diamond of diamonds) {
        try {
          const existing = await nocodb.listRecords(diamondHaravanCollectionsTableId, {
            where: `(diamond_id,eq,${diamond.Id})~and(haravan_collection_id,eq,${DIAMOND_COLLECTION_ID})`
          });

          if (existing.list?.length === 0) {
            await nocodb.createRecords(diamondHaravanCollectionsTableId, {
              diamond_id: diamond.Id,
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
      const nocodb = new NocoDBClient(this.env);

      const productsQuery = await nocodb.listRecords(AutoAddToDiscountProgramService.JEWELRIES_TABLE, {
        where: `(haravan_product_id,eq,${haravanProductId})`,
        limit: 1
      });

      const product = productsQuery.list?.[0];

      if (!product) {
        return;
      }

      if (product.design_id) {
        try {
          const designRes = await nocodb.listRecords(AutoAddToDiscountProgramService.DESIGNS_TABLE, {
            where: `(id,eq,${product.design_id})`,
            limit: 1
          });
          const design = designRes.list?.[0] ?? null;

          if (design && design.collections_id) {
            const collectionRes = await nocodb.listRecords(AutoAddToDiscountProgramService.COLLECTIONS_TABLE, {
              where: `(id,eq,${design.collections_id})`,
              limit: 1
            });
            const collection = collectionRes.list?.[0] ?? null;

            if (collection && EXCLUDED_COLLECTION_TITLES.includes(collection.collection_name)) {
              return;
            }
          }
        } catch (error) {
          Sentry.captureException(error, "addToJewelryCollection");
        }
      }

      const JEWELRY_COLLECTION_ID = this.env.DEFAULT_HARAVAN_JEWELRY_DISCOUNT_COLLECTION_ID;
      const jewelryHaravanCollectionsTableId = AutoAddToDiscountProgramService.JEWELRY_HARAVAN_COLLECTIONS_TABLE;

      try {
        const existing = await nocodb.listRecords(jewelryHaravanCollectionsTableId, {
          where: `(products_id,eq,${product.Id})~and(haravan_collections_id,eq,${JEWELRY_COLLECTION_ID})`
        });

        if (existing.list?.length === 0) {
          await nocodb.createRecords(jewelryHaravanCollectionsTableId, {
            products_id: product.Id,
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
