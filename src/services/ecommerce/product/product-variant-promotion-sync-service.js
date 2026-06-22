import HaravanAPI from "services/clients/haravan-client";
import NocoDBClient from "services/clients/nocodb-client";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";
import * as Sentry from "@sentry/cloudflare";
import { sleep } from "services/utils/sleep";

const JEWELRY_PROMOTION_COLLECTION_ID = "1004602299";

export default class ProductVariantPromotionSyncService {
  constructor(env) {
    this.env = env;
  }

  /**
   * Paginate through all records in a NocoDB table, returning a flat array.
   */
  async #fetchAllRecords(nocodb, table, params = {}, pageSize = 100) {
    const results = [];
    let offset = 0;

    while (true) {
      const res = await nocodb.listRecords(table, { ...params, limit: pageSize, offset });
      const page = res.list || [];
      results.push(...page);

      if (page.length < pageSize) break;
      offset += pageSize;
    }

    return results;
  }

  /**
   * Fetch the first valid custom target from variant_serials_diamonds,
   * resolving diamond → serial → variant chain.
   */
  async #fetchCustomTargets(nocodb) {
    const allVsd = await this.#fetchAllRecords(
      nocodb,
      NOCODB_TABLES.SUPPLY.VARIANT_SERIALS_DIAMONDS,
      { sort: "variant_serials_id" }
    );

    const targets = [];

    for (const vsd of allVsd) {
      const diamond = await this.#fetchDiamond(nocodb, vsd.diamonds_id);
      if (!diamond) continue;

      const serial = await this.#fetchSerial(nocodb, vsd.variant_serials_id);
      if (!serial) continue;

      const variant = await this.#fetchVariant(nocodb, serial.variant_id);
      if (!variant) continue;

      targets.push({
        diamonds_id: vsd.diamonds_id,
        variant_serials_id: vsd.variant_serials_id,
        diamond_haravan_variant_id: diamond.variant_id,
        diamond_haravan_product_id: diamond.product_id,
        jewelry_haravan_variant_id: variant.haravan_variant_id,
        jewelry_haravan_product_id: variant.haravan_product_id,
        jewelry_product_workplace_id: variant.product_id,
        diamond_workplace_id: diamond.id
      });
    }

    return targets;
  }

  async #fetchDiamond(nocodb, diamondsId) {
    const res = await nocodb.listRecords(NOCODB_TABLES.SUPPLY.DIAMONDS, {
      where: `(id,eq,${diamondsId})`,
      limit: 1,
      fields: "id,variant_id,product_id"
    });
    const diamond = res.list?.[0];
    if (!diamond?.variant_id || diamond.variant_id <= 0 || !diamond.product_id || diamond.product_id <= 0) {
      return null;
    }
    return diamond;
  }

  async #fetchSerial(nocodb, variantSerialsId) {
    const res = await nocodb.listRecords(NOCODB_TABLES.SUPPLY.SERIALS, {
      where: `(id,eq,${variantSerialsId})`,
      limit: 1,
      fields: "id,variant_id"
    });
    const serial = res.list?.[0];
    return serial?.variant_id ? serial : null;
  }

  async #fetchVariant(nocodb, variantId) {
    const res = await nocodb.listRecords(NOCODB_TABLES.SUPPLY.VARIANTS, {
      where: `(id,eq,${variantId})`,
      limit: 1,
      fields: "id,haravan_variant_id,haravan_product_id,product_id"
    });
    const variant = res.list?.[0];
    if (!variant?.haravan_variant_id || variant.haravan_variant_id <= 0 ||
      !variant?.haravan_product_id || variant.haravan_product_id <= 0) {
      return null;
    }
    return variant;
  }

  /**
   * Extract structured sets/maps from raw custom targets for downstream use.
   */
  #extractTargetMetadata(customTargets) {
    const target12PercentVariants = [];
    const target12PercentVariantIds = new Set();
    const affectedJewelryProductWorkplaceIds = new Set();
    const affectedJewelryHaravanProductIds = new Set();
    const affectedDiamonds = [];
    const haravanProductToWorkplaceId = new Map();

    for (const target of customTargets) {
      const jVariantId = Number(target.jewelry_haravan_variant_id);
      const jProductId = Number(target.jewelry_haravan_product_id);
      const dVariantId = Number(target.diamond_haravan_variant_id);
      const dProductId = Number(target.diamond_haravan_product_id);

      target12PercentVariants.push({ product_id: jProductId, variant_id: jVariantId });
      target12PercentVariants.push({ product_id: dProductId, variant_id: dVariantId });

      target12PercentVariantIds.add(jVariantId);
      target12PercentVariantIds.add(dVariantId);

      affectedJewelryProductWorkplaceIds.add(Number(target.jewelry_product_workplace_id));
      affectedJewelryHaravanProductIds.add(jProductId);
      haravanProductToWorkplaceId.set(jProductId, Number(target.jewelry_product_workplace_id));

      affectedDiamonds.push({
        diamond_workplace_id: Number(target.diamond_workplace_id),
        diamond_haravan_product_id: dProductId,
        diamond_haravan_variant_id: dVariantId
      });
    }

    return {
      target12PercentVariants,
      target12PercentVariantIds,
      affectedJewelryProductWorkplaceIds,
      affectedJewelryHaravanProductIds,
      affectedDiamonds,
      haravanProductToWorkplaceId
    };
  }

  /**
   * Query collection links and resolve discount values per jewelry product.
   * Returns { originalDiscounts, jewelryProductPromoCollectionHaravanIds }
   */
  async #fetchOriginalDiscounts(nocodb, affectedProductIdsArray) {
    const originalDiscounts = new Map();
    const jewelryProductPromoCollectionHaravanIds = new Map();

    const collectionLinksRes = await nocodb.listRecords(NOCODB_TABLES.MARKETING.JEWELRY_HARAVAN_COLLECTIONS, {
      where: `(products_id,in,${affectedProductIdsArray.join(",")})`,
      fields: "products_id,haravan_collections_id",
      sort: "products_id"
    });

    for (const link of collectionLinksRes.list || []) {
      const hcRes = await nocodb.listRecords(NOCODB_TABLES.MARKETING.HARAVAN_COLLECTIONS, {
        where: `(id,eq,${link.haravan_collections_id})`,
        limit: 1,
        fields: "discount_value,haravan_id"
      });
      const hc = hcRes.list?.[0];
      if (!hc) continue;

      const pId = Number(link.products_id);
      const discount = Number(hc.discount_value || 0);

      if (discount > 0) originalDiscounts.set(pId, discount);

      if (hc.haravan_id) {
        if (!jewelryProductPromoCollectionHaravanIds.has(pId)) {
          jewelryProductPromoCollectionHaravanIds.set(pId, new Set());
        }
        jewelryProductPromoCollectionHaravanIds.get(pId).add(String(hc.haravan_id));
      }
    }

    return { originalDiscounts, jewelryProductPromoCollectionHaravanIds };
  }

  /**
   * Build discount groups: { [percentage]: [{ product_id, variant_id }] }
   * 12% group is seeded from customTargets; remaining variants use their
   * collection-based original discount.
   */
  async #buildDiscountGroups(nocodb, affectedProductIdsArray, target12PercentVariants, target12PercentVariantIds, originalDiscounts) {
    const allJewelryVariantsRes = await nocodb.listRecords(NOCODB_TABLES.SUPPLY.VARIANTS, {
      where: `(product_id,in,${affectedProductIdsArray.join(",")})`,
      fields: "haravan_product_id,haravan_variant_id,product_id"
    });

    const allJewelryVariants = (allJewelryVariantsRes.list || [])
      .filter(v => v.haravan_variant_id && v.haravan_variant_id > 0)
      .map(v => ({
        haravan_product_id: v.haravan_product_id,
        haravan_variant_id: v.haravan_variant_id,
        product_workplace_id: v.product_id
      }));

    const discountGroups = { 12: target12PercentVariants };

    for (const variant of allJewelryVariants) {
      const vId = Number(variant.haravan_variant_id);
      if (target12PercentVariantIds.has(vId)) continue;

      const pWorkplaceId = Number(variant.product_workplace_id);
      const originalDiscount = originalDiscounts.get(pWorkplaceId) || 0;

      if (originalDiscount > 0) {
        if (!discountGroups[originalDiscount]) discountGroups[originalDiscount] = [];
        discountGroups[originalDiscount].push({
          product_id: Number(variant.haravan_product_id),
          variant_id: vId
        });
      }
    }

    return discountGroups;
  }

  /**
   * For each discount percentage, create/update/delete the matching Haravan promotion.
   */
  async #syncHaravanPromotions(haravanClient, discountGroups) {
    const promotionsResponse = await haravanClient.promotion.getPromotions();
    const existingPromotions = promotionsResponse?.promotions || [];

    const percentagesToSync = Object.keys(discountGroups).map(Number);

    for (const pct of percentagesToSync) {
      const variantsList = discountGroups[pct] || [];
      const promoName = `CTKM Biến Thể ${pct}%`;
      const existingPromoSummary = existingPromotions.find(p => p.name === promoName);

      if (variantsList.length === 0) {
        if (existingPromoSummary) {
          await haravanClient.promotion.deletePromotion(existingPromoSummary.id);
          await sleep(500);
        }
        continue;
      }

      const payload = {
        name: promoName,
        ends_at: null,
        starts_at: new Date(Date.now() - 60000).toISOString(),
        value: pct,
        discount_type: "percentage",
        applies_to_quantity: 1,
        applies_to_resource: "product_variant",
        variants: variantsList
      };

      if (existingPromoSummary) {
        const existingVariantIds = new Set((existingPromoSummary.entitled_variant_ids || []).map(Number));

        if (this.#variantIdSetsAreEqual(variantsList, existingVariantIds)) {
          continue;
        }

        await haravanClient.promotion.deletePromotion(existingPromoSummary.id);
        await sleep(500);
      }

      await haravanClient.promotion.createPromotion(payload);
      await sleep(500);
    }
  }

  /**
   * Compare our variantsList [{ variant_id }] against the Set of IDs
   * from Haravan's entitled_variant_ids.
   */
  #variantIdSetsAreEqual(variantsList, existingVariantIdSet) {
    if (variantsList.length !== existingVariantIdSet.size) return false;
    return variantsList.every(v => existingVariantIdSet.has(Number(v.variant_id)));
  }

  /**
   * Remove affected jewelry products from collection-based promotions in DB
   * and mark g1_promotion as 'None' to prevent re-sync.
   */
  async #cleanupJewelryCollectionLinks(nocodb, affectedJewelryProductWorkplaceIds) {
    for (const pWorkplaceId of affectedJewelryProductWorkplaceIds) {

      const linksToDeleteRes = await nocodb.listRecords(NOCODB_TABLES.MARKETING.JEWELRY_HARAVAN_COLLECTIONS, {
        where: `(products_id,eq,${pWorkplaceId})`,
        fields: "products_id,haravan_collections_id",
        sort: "products_id"
      });

      const linksToDelete = linksToDeleteRes.list || [];
      if (linksToDelete.length > 0) {
        const deletePayload = linksToDelete.map(link => ({
          products_id: link.products_id,
          haravan_collections_id: link.haravan_collections_id
        }));
        await nocodb.deleteRecords(NOCODB_TABLES.MARKETING.JEWELRY_HARAVAN_COLLECTIONS, deletePayload);
      }

      await nocodb.updateRecords(NOCODB_TABLES.MARKETING.JEWELRIES, {
        id: pWorkplaceId,
        g1_promotion: "None"
      });
    }
  }

  /**
   * Remove affected jewelry products from the specific Haravan collection (ID 1004602299).
   */
  async #cleanupJewelryHaravanCollects(haravanClient, affectedJewelryHaravanProductIds) {

    for (const hProductId of affectedJewelryHaravanProductIds) {
      try {
        const collectsResponse = await haravanClient.collect.getCollects({ product_id: hProductId });
        const collects = collectsResponse?.collects || [];

        for (const collect of collects) {
          if (String(collect.collection_id) === JEWELRY_PROMOTION_COLLECTION_ID) {
            await haravanClient.collect.deleteCollect(collect.id);
            await sleep(200);
          }
        }
      } catch (err) {
        Sentry.captureException(err);
      }
    }
  }

  // ─── Public Entry Point ───────────────────────────────────────────────────

  async syncVariantPromotions() {
    try {
      const HRV_API_KEY = this.env.HARAVAN_TOKEN;
      if (!HRV_API_KEY) {
        throw new Error("HARAVAN_TOKEN is not configured in the environment.");
      }

      const haravanClient = new HaravanAPI(HRV_API_KEY);
      const nocodb = new NocoDBClient(this.env);

      // 1. Resolve custom targets from variant_serials_diamonds
      const customTargets = await this.#fetchCustomTargets(nocodb);
      if (!customTargets.length) {
        return;
      }

      // 2. Extract IDs and metadata from targets
      const {
        target12PercentVariants,
        target12PercentVariantIds,
        affectedJewelryProductWorkplaceIds,
        affectedJewelryHaravanProductIds
      } = this.#extractTargetMetadata(customTargets);

      const affectedProductIdsArray = Array.from(affectedJewelryProductWorkplaceIds);

      // 3. Resolve original discount percentages from collection links
      const { originalDiscounts } = await this.#fetchOriginalDiscounts(nocodb, affectedProductIdsArray);

      // 4. Build discount groups ({ [pct]: [variants] })
      const discountGroups = await this.#buildDiscountGroups(
        nocodb,
        affectedProductIdsArray,
        target12PercentVariants,
        target12PercentVariantIds,
        originalDiscounts
      );

      // 5. Sync promotions on Haravan
      await this.#syncHaravanPromotions(haravanClient, discountGroups);

      // 6. Cleanup: remove jewelry products from collection-based promotions
      await this.#cleanupJewelryCollectionLinks(nocodb, affectedJewelryProductWorkplaceIds);
      await this.#cleanupJewelryHaravanCollects(haravanClient, affectedJewelryHaravanProductIds);

    } catch (error) {
      Sentry.captureException(error);
    }
  }
}
