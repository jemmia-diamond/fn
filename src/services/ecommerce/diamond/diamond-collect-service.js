import { WorkplaceClient } from "services/clients/workplace-client";
import DiamondDiscountService from "services/ecommerce/diamond/diamond-discount-service";
import Database from "src/services/database";
import * as Sentry from "@sentry/cloudflare";
import HaravanAPI from "services/clients/haravan-client";

export default class DiamondCollectService {
  constructor(env) {
    this.env = env;
  }

  static DEFAULT_DISCOUNT_PERCENT = 8;

  async syncDiamondsToCollects() {
    try {
      const { workplaceClient, haravanApi, db } = await this._initializeClients();
      const activeRules = await DiamondDiscountService.getActiveRules(this.env);
      const allCollections = await this._fetchCollections(workplaceClient, activeRules);

      const { ruleCollections, discountCollectionIds } = this._buildRuleCollectionsMap(allCollections);

      await this._processDiamondBatches({
        db,
        workplaceClient,
        haravanApi,
        activeRules,
        ruleCollections,
        discountCollectionIds
      });

    } catch (error) {
      console.warn("Error in syncDiamondsToCollects:", error);
      Sentry.captureException(error);
    }
  }

  async _initializeClients() {
    const WORKPLACE_BASE_ID = this.env.NOCODB_SUPPLY_BASE_ID;
    const [workplaceClient, HRV_API_KEY] = await Promise.all([
      WorkplaceClient.initialize(this.env, WORKPLACE_BASE_ID),
      this.env.HARAVAN_TOKEN_SECRET.get()
    ]);

    return {
      workplaceClient,
      haravanApi: new HaravanAPI(HRV_API_KEY),
      db: Database.instance(this.env)
    };
  }

  async _fetchCollections(workplaceClient, activeRules) {
    const uniquePercents = [...new Set(activeRules.map(r => r.discount_percent))];

    if (uniquePercents.length === 0) {
      return { list: [] };
    }

    const where = `(discount_type,eq,percent)~and(discount_value,in,${uniquePercents.join(",")})`;
    return await workplaceClient.haravanCollections.list({
      where: where,
      limit: 1000
    });
  }

  _buildRuleCollectionsMap(allCollections) {
    const ruleCollections = {};
    let baseCollectionId = null;
    const allManagedIds = [];

    for (const col of (allCollections.list || [])) {
      if (col.discount_value) {
        const discountVal = col.discount_value;

        if (!ruleCollections[discountVal]) {
          ruleCollections[discountVal] = {};
        }

        if (col.id) {
          ruleCollections[discountVal].nocodbId = col.id;
          allManagedIds.push(col.id);
          if (discountVal == DiamondCollectService.DEFAULT_DISCOUNT_PERCENT) {
            baseCollectionId = col.id;
          }
        }

        if (col.haravan_id) {
          ruleCollections[discountVal].haravanId = col.haravan_id;
        }
      }
    }

    return {
      ruleCollections,
      discountCollectionIds: allManagedIds.filter(id => id !== baseCollectionId)
    };
  }

  async _processDiamondBatches(context) {
    const { db } = context;
    let offset = 0;
    const limit = 100;

    while (true) {
      const diamonds = await this._fetchDiamonds(db, limit, offset);

      if (!diamonds || diamonds.length === 0) {
        break;
      }

      for (const diamond of diamonds) {
        await this._processSingleDiamond(diamond, context);
      }

      offset += limit;
    }
  }

  async _fetchDiamonds(db, limit, offset) {
    return await db.$queryRaw`
      SELECT
        d.*
      FROM
        workplace.diamonds d
      LEFT JOIN (
        SELECT variant_id, SUM(qty_available) as total_qty
        FROM haravan.warehouse_inventories
        GROUP BY variant_id
      ) i ON d.variant_id = i.variant_id
      WHERE
        d.auto_create_haravan_product = true
        AND d.product_id > 0
        AND d.variant_id > 0
        AND (
          d.is_incoming = true
          OR COALESCE(i.total_qty, 0) > 0
        )
      ORDER BY
        d.id DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
  }

  async _processSingleDiamond(diamond, context) {
    try {
      const { activeRules, ruleCollections, discountCollectionIds, workplaceClient, haravanApi } = context;

      const discountPercent = DiamondDiscountService.calculateDiscountPercent({
        diamondSize: parseFloat(diamond.edge_size_2 || 0),
        rules: activeRules
      });

      console.warn("Discount percent for diamond:", diamond.id, discountPercent, diamond.edge_size_2);

      const rules = ruleCollections[discountPercent] || {};
      const targetNocodbCollectionId = rules.nocodbId || null;

      return;

      await this._syncNocoDBCollections(diamond, targetNocodbCollectionId, discountCollectionIds, workplaceClient);
      await this._syncHaravanCollections(diamond, targetNocodbCollectionId, rules.haravanId, workplaceClient, haravanApi);

    } catch (error) {
      if (this._isIgnorableError(error)) {
        return;
      }
      console.warn("Error processing diamond:", diamond.id, error);
      Sentry.captureException(error);
    }
  }

  async _syncNocoDBCollections(diamond, targetCollectionId, discountCollectionIds, workplaceClient) {
    const existingEntries = await workplaceClient.diamondHaravanCollections.list({
      where: `(diamond_id,eq,${diamond.id})`
    });

    const existingList = existingEntries.list || [];

    for (const entry of existingList) {
      const isDiscountCollection = discountCollectionIds.includes(entry.haravan_collection_id);
      const isCurrentCollection = entry.haravan_collection_id === targetCollectionId;

      if (isDiscountCollection && !isCurrentCollection) {
        console.warn("Removing discount collection for diamond:", diamond.id, entry.haravan_collection_id);
        await workplaceClient.diamondHaravanCollections.deleteMany([{
          diamond_id: diamond.id,
          haravan_collection_id: entry.haravan_collection_id
        }]);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
  }

  async _syncHaravanCollections(diamond, targetNocodbCollectionId, targetHaravanCollectionId, workplaceClient, haravanApi) {
    if (!targetNocodbCollectionId) return;

    // Check if the link exists in NocoDB first
    const existingEntries = await workplaceClient.diamondHaravanCollections.list({
      where: `(diamond_id,eq,${diamond.id})~and(haravan_collection_id,eq,${targetNocodbCollectionId})`
    });

    const exists = (existingEntries.list || []).length > 0;

    if (!exists) {
      console.warn("Adding discount collection for diamond:", diamond.id, targetNocodbCollectionId);
      await workplaceClient.diamondHaravanCollections.create({
        diamond_id: diamond.id,
        haravan_collection_id: targetNocodbCollectionId
      });
      await new Promise(resolve => setTimeout(resolve, 1500));
    } else {
      // If NocoDB link exists, ensure Haravan collect exists
      if (targetHaravanCollectionId) {
        await this._createHaravanCollect(diamond, targetHaravanCollectionId, haravanApi);
      }
    }
  }

  async _createHaravanCollect(diamond, haravanCollectionId, haravanApi) {
    try {
      console.warn("Creating collect for Diamond", diamond.product_id, haravanCollectionId);
      const collect = await haravanApi.collect.createCollect({
        "product_id": diamond.product_id,
        "collection_id": haravanCollectionId
      });
      console.warn("Created collect for Diamond", diamond.id, haravanCollectionId, collect);
    } catch (hrvError) {
      console.warn("Error creating collect for Diamond", diamond.id, haravanCollectionId);
      if (hrvError.response?.status === 422) {
        console.warn(`Ignored 422 error creating collect for Diamond ${diamond.id} and Collection ${haravanCollectionId}`);
      } else {
        throw hrvError;
      }
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  _isIgnorableError(error) {
    const errorData = error.response?.data;
    return errorData?.code === "23505" || errorData?.message === "This record already exists.";
  }
}
