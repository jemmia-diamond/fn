import HaravanAPI from "services/clients/haravan-client";
import NocoDBClient from "services/clients/nocodb-client";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";
import * as Sentry from "@sentry/cloudflare";
import { sleep } from "services/utils/sleep";

interface CustomTarget {
  diamonds_id: number;
  variant_serials_id: number;
  diamond_haravan_variant_id: number;
  diamond_haravan_product_id: number;
  jewelry_haravan_variant_id: number;
  jewelry_haravan_product_id: number;
  jewelry_product_workplace_id: number;
  diamond_workplace_id: number;
}

export default class ProductVariantPromotionSyncService {
  static CONFIG = {
    API_REQUEST_DELAY: 200,
    JEWELRY_PROMOTION_COLLECTION_ID: "1004602299",
    PROMOTION_NAME_PREFIX: "CTKM Biến Thể",
    DEFAULT_TARGET_COMBO_DISCOUNT: 12
  };

  private env: any;
  private targetDiscount: number;

  constructor(env: any) {
    this.env = env;
    this.targetDiscount = Number(this.env.TARGET_COMBO_DISCOUNT || ProductVariantPromotionSyncService.CONFIG.DEFAULT_TARGET_COMBO_DISCOUNT);
  }

  /**
   * Paginate through all records in a NocoDB table, returning a flat array.
   */
  private async fetchAllRecords(nocodb: NocoDBClient, table: string, params: Record<string, any> = {}, pageSize = 100): Promise<any[]> {
    const results: any[] = [];
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
  private async fetchCustomTargets(nocodb: NocoDBClient): Promise<CustomTarget[]> {
    const allVsd = await this.fetchAllRecords(
      nocodb,
      NOCODB_TABLES.SUPPLY.VARIANT_SERIALS_DIAMONDS,
      { sort: "variant_serials_id" }
    );

    if (!allVsd.length) return [];

    const diamondIds = [...new Set(allVsd.map(v => v.diamonds_id).filter(Boolean))];
    const serialIds = [...new Set(allVsd.map(v => v.variant_serials_id).filter(Boolean))];

    // Batch fetch Diamonds and Serials
    const [diamondsRes, serialsRes] = await Promise.all([
      this.fetchBatchRecords(nocodb, NOCODB_TABLES.SUPPLY.DIAMONDS, diamondIds, "id,variant_id,product_id"),
      this.fetchBatchRecords(nocodb, NOCODB_TABLES.SUPPLY.SERIALS, serialIds, "id,variant_id")
    ]);

    const diamondMap = new Map<number, any>(diamondsRes.map(d => [d.id, d]));
    const serialMap = new Map<number, any>(serialsRes.map(s => [s.id, s]));

    const variantIds = [...new Set(serialsRes.map(s => s.variant_id).filter(Boolean))];
    const variantsRes = await this.fetchBatchRecords(nocodb, NOCODB_TABLES.SUPPLY.VARIANTS, variantIds, "id,haravan_variant_id,haravan_product_id,product_id");
    const variantMap = new Map<number, any>(variantsRes.map(v => [v.id, v]));

    const targets: CustomTarget[] = [];
    for (const vsd of allVsd) {
      const diamond = diamondMap.get(vsd.diamonds_id);
      if (!diamond || !diamond.variant_id || diamond.variant_id <= 0 || !diamond.product_id || diamond.product_id <= 0) continue;

      const serial = serialMap.get(vsd.variant_serials_id);
      if (!serial || !serial.variant_id) continue;

      const variant = variantMap.get(serial.variant_id);
      if (!variant || !variant.haravan_variant_id || variant.haravan_variant_id <= 0 || !variant.haravan_product_id || variant.haravan_product_id <= 0) continue;

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

  private async fetchBatchRecords(nocodb: NocoDBClient, table: string, ids: any[], fields: string): Promise<any[]> {
    if (!ids.length) return [];
    const res = await nocodb.listRecords(table, {
      where: `(id,in,${ids.join(",")})`,
      limit: ids.length,
      fields
    });
    return res.list || [];
  }

  /**
   * Extract structured sets/maps from raw custom targets for downstream use.
   */
  private extractTargetMetadata(customTargets: CustomTarget[]) {
    const targetVariants: { product_id: number; variant_id: number }[] = [];
    const targetVariantIds = new Set<number>();
    const affectedJewelryProductWorkplaceIds = new Set<number>();
    const affectedJewelryHaravanProductIds = new Set<number>();
    const affectedDiamonds: { diamond_workplace_id: number; diamond_haravan_product_id: number; diamond_haravan_variant_id: number }[] = [];
    const haravanProductToWorkplaceId = new Map<number, number>();

    for (const target of customTargets) {
      const jVariantId = Number(target.jewelry_haravan_variant_id);
      const jProductId = Number(target.jewelry_haravan_product_id);
      const dVariantId = Number(target.diamond_haravan_variant_id);
      const dProductId = Number(target.diamond_haravan_product_id);

      targetVariants.push({ product_id: jProductId, variant_id: jVariantId });
      targetVariants.push({ product_id: dProductId, variant_id: dVariantId });

      targetVariantIds.add(jVariantId);
      targetVariantIds.add(dVariantId);

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
      targetVariants,
      targetVariantIds,
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
  private async fetchOriginalDiscounts(nocodb: NocoDBClient, affectedProductIdsArray: number[]) {
    const originalDiscounts = new Map<number, number>();
    const jewelryProductPromoCollectionHaravanIds = new Map<number, Set<string>>();

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
          jewelryProductPromoCollectionHaravanIds.set(pId, new Set<string>());
        }
        jewelryProductPromoCollectionHaravanIds.get(pId)!.add(String(hc.haravan_id));
      }
    }

    return { originalDiscounts, jewelryProductPromoCollectionHaravanIds };
  }

  /**
   * Build discount groups: { [percentage]: [{ product_id, variant_id }] }
   * collection-based original discount.
   */
  private async buildDiscountGroups(
    nocodb: NocoDBClient,
    affectedProductIdsArray: number[],
    targetVariants: { product_id: number; variant_id: number }[],
    targetVariantIds: Set<number>,
    originalDiscounts: Map<number, number>
  ): Promise<Record<number, { product_id: number; variant_id: number }[]>> {
    const allJewelryVariantsRes = await nocodb.listRecords(NOCODB_TABLES.SUPPLY.VARIANTS, {
      where: `(product_id,in,${affectedProductIdsArray.join(",")})`,
      fields: "haravan_product_id,haravan_variant_id,product_id"
    });

    const allJewelryVariants = (allJewelryVariantsRes.list || [])
      .filter((v: any) => v.haravan_variant_id && v.haravan_variant_id > 0)
      .map((v: any) => ({
        haravan_product_id: v.haravan_product_id,
        haravan_variant_id: v.haravan_variant_id,
        product_workplace_id: v.product_id
      }));

    const discountGroups: Record<number, { product_id: number; variant_id: number }[]> = {
      [this.targetDiscount]: targetVariants
    };

    for (const variant of allJewelryVariants) {
      const vId = Number(variant.haravan_variant_id);
      if (targetVariantIds.has(vId)) continue;

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
  private async syncHaravanPromotions(haravanClient: any, discountGroups: Record<number, { product_id: number; variant_id: number }[]>) {
    const promotionsResponse = await haravanClient.promotion.getPromotions();
    const existingPromotions = promotionsResponse?.promotions || [];

    const percentagesToSync = Object.keys(discountGroups).map(Number);
    for (const pct of percentagesToSync) {
      const variantsList = discountGroups[pct] || [];
      const promoName = `${ProductVariantPromotionSyncService.CONFIG.PROMOTION_NAME_PREFIX} ${pct}%`;
      const existingPromoSummary = existingPromotions.find((p: any) => p.name === promoName);

      if (variantsList.length === 0) {
        if (existingPromoSummary) {
          await haravanClient.promotion.deletePromotion(existingPromoSummary.id);
          await sleep(ProductVariantPromotionSyncService.CONFIG.API_REQUEST_DELAY);
        }
        continue;
      }

      const payload = {
        name: promoName,
        ends_at: null,
        starts_at: new Date(Date.now()).toISOString(),
        value: pct,
        discount_type: "percentage",
        applies_to_quantity: 1,
        applies_to_resource: "product_variant",
        variants: variantsList
      };
      if (existingPromoSummary) {
        const existingVariantIds = new Set<number>((existingPromoSummary.entitled_variant_ids || []).map(Number));

        if (this.variantIdSetsAreEqual(variantsList, existingVariantIds)) {
          continue;
        }

        await haravanClient.promotion.deletePromotion(existingPromoSummary.id);
        await sleep(ProductVariantPromotionSyncService.CONFIG.API_REQUEST_DELAY);
      }

      await haravanClient.promotion.createPromotion(payload);
      await sleep(ProductVariantPromotionSyncService.CONFIG.API_REQUEST_DELAY);
    }
  }

  /**
   * Compare our variantsList [{ variant_id }] against the Set of IDs
   * from Haravan's entitled_variant_ids.
   */
  private variantIdSetsAreEqual(variantsList: { variant_id: number }[], existingVariantIdSet: Set<number>): boolean {
    if (variantsList.length !== existingVariantIdSet.size) return false;
    return variantsList.every(v => existingVariantIdSet.has(Number(v.variant_id)));
  }

  /**
   * Remove affected jewelry products from collection-based promotions in DB
   * and mark g1_promotion as 'None' to prevent re-sync.
   */
  private async cleanupJewelryCollectionLinks(nocodb: NocoDBClient, affectedJewelryProductWorkplaceIds: Set<number>) {
    if (!affectedJewelryProductWorkplaceIds.size) return;

    const idsArray = Array.from(affectedJewelryProductWorkplaceIds);

    const linksToDeleteRes = await nocodb.listRecords(NOCODB_TABLES.MARKETING.JEWELRY_HARAVAN_COLLECTIONS, {
      where: `(products_id,in,${idsArray.join(",")})`,
      fields: "products_id,haravan_collections_id"
    });
    const linksToDelete = linksToDeleteRes.list || [];
    if (linksToDelete.length > 0) {
      const deletePayload = linksToDelete.map((link: any) => ({
        products_id: link.products_id,
        haravan_collections_id: link.haravan_collections_id
      }));
      await nocodb.deleteRecords(NOCODB_TABLES.MARKETING.JEWELRY_HARAVAN_COLLECTIONS, deletePayload);
    }

    for (const pWorkplaceId of affectedJewelryProductWorkplaceIds) {
      await nocodb.updateRecords(NOCODB_TABLES.MARKETING.JEWELRIES, {
        id: pWorkplaceId,
        g1_promotion: "None"
      });
    }
  }

  /**
   * Remove affected jewelry products from the specific Haravan collection (ID 1004602299).
   */
  private async cleanupJewelryHaravanCollects(haravanClient: any, affectedJewelryHaravanProductIds: Set<number>) {
    for (const hProductId of affectedJewelryHaravanProductIds) {
      try {
        const collectsResponse = await haravanClient.collect.getCollects({ product_id: hProductId });
        const collects = collectsResponse?.collects || [];

        for (const collect of collects) {
          if (String(collect.collection_id) === ProductVariantPromotionSyncService.CONFIG.JEWELRY_PROMOTION_COLLECTION_ID) {
            await haravanClient.collect.deleteCollect(collect.id);
            await sleep(ProductVariantPromotionSyncService.CONFIG.API_REQUEST_DELAY);
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
      const customTargets = await this.fetchCustomTargets(nocodb);
      if (!customTargets.length) {
        return;
      }

      // 2. Extract IDs and metadata from targets
      const {
        targetVariants,
        targetVariantIds,
        affectedJewelryProductWorkplaceIds,
        affectedJewelryHaravanProductIds
      } = this.extractTargetMetadata(customTargets);

      const affectedProductIdsArray = Array.from(affectedJewelryProductWorkplaceIds);

      // 3. Resolve original discount percentages from collection links
      const { originalDiscounts } = await this.fetchOriginalDiscounts(nocodb, affectedProductIdsArray);

      // 4. Build discount groups ({ [pct]: [variants] })
      const discountGroups = await this.buildDiscountGroups(
        nocodb,
        affectedProductIdsArray,
        targetVariants,
        targetVariantIds,
        originalDiscounts
      );

      // 5. Sync promotions on Haravan
      await this.syncHaravanPromotions(haravanClient, discountGroups);

      // 6. Cleanup: remove jewelry products from collection-based promotions
      await this.cleanupJewelryCollectionLinks(nocodb, affectedJewelryProductWorkplaceIds);
      await this.cleanupJewelryHaravanCollects(haravanClient, affectedJewelryHaravanProductIds);

    } catch (error) {
      Sentry.captureException(error);
    }
  }
}
