import NocoDBClient from "services/clients/nocodb-client";
import DiamondCollectService from "services/ecommerce/diamond/diamond-collect-service";
import DiamondDiscountService from "services/ecommerce/diamond/diamond-discount-service";
import { HARAVAN_TOPIC } from "services/ecommerce/enum";
import { HRV_PRODUCT_TYPE, SKU_LENGTH } from "services/haravan/products/product-variant/constant";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";

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

  constructor(env) {
    this.env = env;
  }

  static async dequeueProductQueue(batch, env) {
    const service = new AutoAddToDiscountProgramService(env);
    for (const message of batch.messages) {
      const body = message.body;
      const haravanTopic = body.haravan_topic;

      if (haravanTopic === HARAVAN_TOPIC.PRODUCT_UPDATE || haravanTopic === HARAVAN_TOPIC.PRODUCT_CREATED) {
        await service.processProduct(body);
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
    const nocodb = new NocoDBClient(this.env);

    const diamondsQuery = await nocodb.listRecords(NOCODB_TABLES.MARKETING.DIAMONDS, {
      where: `(product_id,eq,${haravanProductId})`,
      fields: "id,edge_size_2"
    });
    const diamonds = diamondsQuery.list || [];

    if (!diamonds || diamonds.length === 0) {
      return;
    }

    const activeRules = await DiamondDiscountService.getActiveRules(this.env);

    const dcs = new DiamondCollectService(this.env);
    const collections = await dcs._fetchCollections(nocodb, activeRules);
    const dcsContext = dcs._buildRuleCollectionsMap(collections);
    const { ruleCollections } = dcsContext;

    for (const diamond of diamonds) {
      const discountPercent = DiamondDiscountService.calculateDiscountPercent({
        diamondSize: parseFloat(diamond.edge_size_2 || 0),
        rules: activeRules
      });

      const DIAMOND_COLLECTION_ID = ruleCollections[discountPercent]?.nocodbId;
      const defaultCollectionId = this.env.DEFAULT_HARAVAN_DIAMOND_DISCOUNT_COLLECTION_ID;

      await DiamondDiscountService.syncNocoDBDiscountCollections({
        diamond,
        targetCollectionId: DIAMOND_COLLECTION_ID || defaultCollectionId,
        allPercentCollectionIds: dcsContext.allPercentCollectionIds,
        defaultCollectionId: defaultCollectionId,
        nocodb
      });
    }
  }

  async addToJewelryCollection(haravanProductId) {
    const nocodb = new NocoDBClient(this.env);

    if (await this._isComboJewelryProduct(nocodb, haravanProductId)) {
      return;
    }

    const productsQuery = await nocodb.listRecords(NOCODB_TABLES.MARKETING.JEWELRIES, {
      where: `(haravan_product_id,eq,${haravanProductId})`,
      limit: 1,
      fields: "id,design_id"
    });

    const product = productsQuery.list?.[0];

    if (!product) {
      return;
    }

    if (product.design_id) {
      const designRes = await nocodb.listRecords(NOCODB_TABLES.MARKETING.DESIGNS, {
        where: `(id,eq,${product.design_id})`,
        limit: 1,
        fields: "id,collections_id"
      });
      const design = designRes.list?.[0] ?? null;

      if (design && design.collections_id) {
        const collectionRes = await nocodb.listRecords(NOCODB_TABLES.MARKETING.COLLECTIONS, {
          where: `(id,eq,${design.collections_id})`,
          limit: 1,
          fields: "id,collection_name"
        });
        const collection = collectionRes.list?.[0] ?? null;

        if (collection && EXCLUDED_COLLECTION_TITLES.includes(collection.collection_name)) {
          return;
        }
      }
    }

    const JEWELRY_COLLECTION_ID = this.env.DEFAULT_HARAVAN_JEWELRY_DISCOUNT_COLLECTION_ID;
    const jewelryHaravanCollectionsTableId = NOCODB_TABLES.MARKETING.JEWELRY_HARAVAN_COLLECTIONS;

    try {
      const existing = await nocodb.listRecords(jewelryHaravanCollectionsTableId, {
        where: `(products_id,eq,${product.id})~and(haravan_collections_id,eq,${JEWELRY_COLLECTION_ID})`,
        limit: 1,
        fields: "products_id"
      });

      if (existing.list?.length === 0) {
        await nocodb.createRecords(jewelryHaravanCollectionsTableId, {
          products: { id: product.id },
          haravan_collections: { id: JEWELRY_COLLECTION_ID }
        });
      }
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.code === "23505" || errorData?.message === "This record already exists.") {
        return;
      }
      throw error;
    }
  }

  async _isComboJewelryProduct(nocodb, haravanProductId) {
    const variantsRes = await nocodb.listRecords(NOCODB_TABLES.SUPPLY.VARIANTS, {
      where: `(haravan_product_id,eq,${haravanProductId})`,
      fields: "id"
    });
    const variantIds = variantsRes.list?.map(v => v.id) || [];

    if (variantIds.length === 0) {
      return false;
    }

    const serialsRes = await nocodb.listRecords(NOCODB_TABLES.SUPPLY.SERIALS, {
      where: `(variant_id,in,${variantIds.join(",")})`,
      fields: "id"
    });
    const serialIds = serialsRes.list?.map(s => s.id) || [];

    if (serialIds.length === 0) {
      return false;
    }

    const comboRes = await nocodb.listRecords(NOCODB_TABLES.SUPPLY.VARIANT_SERIALS_DIAMONDS, {
      where: `(variant_serials_id,in,${serialIds.join(",")})`,
      limit: 1,
      fields: "variant_serials_id"
    });

    return !!(comboRes.list && comboRes.list.length > 0);
  }
}
