import { NOCODB_TABLES } from "src/constants/nocodb-tables";
import * as Sentry from "@sentry/cloudflare";
import { sleep } from "services/utils/sleep";

// Combo variant-level promotions. Ported out of the retired
// ProductVariantPromotionSyncService so the single promotion flow
// (DiamondCollectService.syncDiamondsToCollects) owns it. Takes pre-resolved
// combo targets (from combo-targets.fetchComboTargets) and shared clients.

const CONFIG = {
  API_REQUEST_DELAY: 200,
  JEWELRY_PROMOTION_COLLECTION_ID: "1004602299",
  PROMOTION_NAME_PREFIX: "CTKM Biến Thể",
  DEFAULT_TARGET_COMBO_DISCOUNT: 12,
  DEFAULT_JEWELRY_DISCOUNT: 16
};

async function fetchAllRecords(nocodb, table, params = {}, pageSize = 100) {
  const results = [];
  let offset = 0;
  while (true) {
    const res = await nocodb.listRecords(table, {
      ...params,
      limit: pageSize,
      offset
    });
    const page = res.list || [];
    results.push(...page);
    if (page.length < pageSize) break;
    offset += pageSize;
  }
  return results;
}

function extractTargetMetadata(customTargets) {
  const targetVariants = [];
  const targetVariantIds = new Set();
  const affectedJewelryProductWorkplaceIds = new Set();
  const affectedJewelryHaravanProductIds = new Set();

  for (const target of customTargets) {
    const jVariantId = Number(target.jewelry_haravan_variant_id);
    const jProductId = Number(target.jewelry_haravan_product_id);
    const dVariantId = Number(target.diamond_haravan_variant_id);
    const dProductId = Number(target.diamond_haravan_product_id);

    targetVariants.push({ product_id: jProductId, variant_id: jVariantId });
    targetVariants.push({ product_id: dProductId, variant_id: dVariantId });

    targetVariantIds.add(jVariantId);
    targetVariantIds.add(dVariantId);

    affectedJewelryProductWorkplaceIds.add(
      Number(target.jewelry_product_workplace_id)
    );
    affectedJewelryHaravanProductIds.add(jProductId);
  }

  return {
    targetVariants,
    targetVariantIds,
    affectedJewelryProductWorkplaceIds,
    affectedJewelryHaravanProductIds
  };
}

async function fetchOriginalDiscounts(nocodb, affectedProductIdsArray) {
  const originalDiscounts = new Map();
  if (!affectedProductIdsArray.length) return { originalDiscounts };

  const collectionLinks = await fetchAllRecords(
    nocodb,
    NOCODB_TABLES.MARKETING.JEWELRY_HARAVAN_COLLECTIONS,
    {
      where: `(products_id,in,${affectedProductIdsArray.join(",")})`,
      fields: "products_id,haravan_collections_id",
      sort: "products_id"
    }
  );

  for (const link of collectionLinks) {
    const hcRes = await nocodb.listRecords(
      NOCODB_TABLES.MARKETING.HARAVAN_COLLECTIONS,
      {
        where: `(id,eq,${link.haravan_collections_id})`,
        limit: 1,
        fields: "discount_value,haravan_id"
      }
    );
    const hc = hcRes.list?.[0];
    if (!hc) continue;

    const pId = Number(link.products_id);
    const discount = Number(hc.discount_value || 0);
    if (discount > 0) originalDiscounts.set(pId, discount);
  }

  return { originalDiscounts };
}

async function buildDiscountGroups(
  nocodb,
  affectedProductIdsArray,
  targetVariants,
  targetVariantIds,
  originalDiscounts,
  targetDiscount,
  jewelryDiscount
) {
  const discountGroups = { [targetDiscount]: targetVariants };
  if (!affectedProductIdsArray.length) return discountGroups;

  const allJewelryVariantsList = await fetchAllRecords(
    nocodb,
    NOCODB_TABLES.SUPPLY.VARIANTS,
    {
      where: `(product_id,in,${affectedProductIdsArray.join(",")})`,
      fields: "haravan_product_id,haravan_variant_id,product_id"
    }
  );

  for (const v of allJewelryVariantsList) {
    if (!v.haravan_variant_id || v.haravan_variant_id <= 0) continue;
    const vId = Number(v.haravan_variant_id);
    if (targetVariantIds.has(vId)) continue;

    const pWorkplaceId = Number(v.product_id);
    const originalDiscount =
      originalDiscounts.get(pWorkplaceId) || jewelryDiscount;

    if (originalDiscount > 0) {
      if (!discountGroups[originalDiscount])
        discountGroups[originalDiscount] = [];
      discountGroups[originalDiscount].push({
        product_id: Number(v.haravan_product_id),
        variant_id: vId
      });
    }
  }

  return discountGroups;
}

function variantIdSetsAreEqual(variantsList, existingVariantIdSet) {
  if (variantsList.length !== existingVariantIdSet.size) return false;
  return variantsList.every((v) =>
    existingVariantIdSet.has(Number(v.variant_id))
  );
}

async function syncHaravanPromotions(haravanClient, discountGroups) {
  const promotionsResponse = await haravanClient.promotion.getPromotions();
  const existingPromotions = promotionsResponse?.promotions || [];

  for (const pct of Object.keys(discountGroups).map(Number)) {
    const variantsList = discountGroups[pct] || [];
    const promoName = `${CONFIG.PROMOTION_NAME_PREFIX} ${pct}%`;
    const existingPromoSummary = existingPromotions.find(
      (p) => p.name === promoName
    );

    if (variantsList.length === 0) {
      if (existingPromoSummary) {
        await haravanClient.promotion.deletePromotion(existingPromoSummary.id);
        await sleep(CONFIG.API_REQUEST_DELAY);
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
      const existingVariantIds = new Set(
        (existingPromoSummary.entitled_variant_ids || []).map(Number)
      );
      if (variantIdSetsAreEqual(variantsList, existingVariantIds)) continue;

      await haravanClient.promotion.deletePromotion(existingPromoSummary.id);
      await sleep(CONFIG.API_REQUEST_DELAY);
    }

    await haravanClient.promotion.createPromotion(payload);
    await sleep(CONFIG.API_REQUEST_DELAY);
  }
}

async function cleanupJewelryCollectionLinks(
  nocodb,
  affectedJewelryProductWorkplaceIds
) {
  if (!affectedJewelryProductWorkplaceIds.size) return;
  const idsArray = Array.from(affectedJewelryProductWorkplaceIds);

  const linksToDelete = await fetchAllRecords(
    nocodb,
    NOCODB_TABLES.MARKETING.JEWELRY_HARAVAN_COLLECTIONS,
    {
      where: `(products_id,in,${idsArray.join(",")})`,
      fields: "products_id,haravan_collections_id"
    }
  );
  if (linksToDelete.length > 0) {
    const deletePayload = linksToDelete.map((link) => ({
      products_id: link.products_id,
      haravan_collections_id: link.haravan_collections_id
    }));
    await nocodb.deleteRecords(
      NOCODB_TABLES.MARKETING.JEWELRY_HARAVAN_COLLECTIONS,
      deletePayload
    );
  }

  for (const pWorkplaceId of affectedJewelryProductWorkplaceIds) {
    await nocodb.updateRecords(NOCODB_TABLES.MARKETING.JEWELRIES, {
      id: pWorkplaceId,
      g1_promotion: "None"
    });
  }
}

async function cleanupJewelryHaravanCollects(
  haravanClient,
  affectedJewelryHaravanProductIds
) {
  for (const hProductId of affectedJewelryHaravanProductIds) {
    try {
      const collectsResponse = await haravanClient.collect.getCollects({
        product_id: hProductId
      });
      const collects = collectsResponse?.collects || [];
      for (const collect of collects) {
        if (
          String(collect.collection_id) ===
          CONFIG.JEWELRY_PROMOTION_COLLECTION_ID
        ) {
          await haravanClient.collect.deleteCollect(collect.id);
          await sleep(CONFIG.API_REQUEST_DELAY);
        }
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  }
}

/**
 * Sync combo variant-level promotions for pre-resolved combo targets.
 * @param {object} args
 * @param {any} args.env
 * @param {import("services/clients/nocodb-client").default} args.nocodb
 * @param {any} args.haravanApi
 * @param {Array} args.comboTargets - from combo-targets.fetchComboTargets
 */
export async function syncVariantPromotions({
  env,
  nocodb,
  haravanApi,
  comboTargets
}) {
  if (!comboTargets || !comboTargets.length) return;

  const targetDiscount = Number(
    env.TARGET_COMBO_DISCOUNT || CONFIG.DEFAULT_TARGET_COMBO_DISCOUNT
  );
  const jewelryDiscount = Number(
    env.DEFAULT_JEWELRY_DISCOUNT || CONFIG.DEFAULT_JEWELRY_DISCOUNT
  );

  const {
    targetVariants,
    targetVariantIds,
    affectedJewelryProductWorkplaceIds,
    affectedJewelryHaravanProductIds
  } = extractTargetMetadata(comboTargets);

  const affectedProductIdsArray = Array.from(
    affectedJewelryProductWorkplaceIds
  );

  const { originalDiscounts } = await fetchOriginalDiscounts(
    nocodb,
    affectedProductIdsArray
  );

  const discountGroups = await buildDiscountGroups(
    nocodb,
    affectedProductIdsArray,
    targetVariants,
    targetVariantIds,
    originalDiscounts,
    targetDiscount,
    jewelryDiscount
  );

  await syncHaravanPromotions(haravanApi, discountGroups);

  await cleanupJewelryCollectionLinks(
    nocodb,
    affectedJewelryProductWorkplaceIds
  );
  await cleanupJewelryHaravanCollects(
    haravanApi,
    affectedJewelryHaravanProductIds
  );
}
