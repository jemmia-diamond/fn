import NocoDBClient from "services/clients/nocodb-client";
import DiamondDiscountService from "services/ecommerce/diamond/diamond-discount-service";
import Database from "src/services/database";
import * as Sentry from "@sentry/cloudflare";
import HaravanAPI from "services/clients/haravan-client";

export default class DiamondCollectService {
  constructor(env) {
    this.env = env;
  }

  static DEFAULT_DISCOUNT_PERCENT = 8;
  static HARAVAN_COLLECTIONS_TABLE = "mpgeruya41k3zcg";
  static DIAMONDS_HARAVAN_COLLECTION_TABLE = "mxu3rae3quofz6n";

  async syncDiamondsToCollects() {
    try {
      const { haravanApi, db, nocoClient } = await this._initializeClients();
      const activeRules = await DiamondDiscountService.getActiveRules(this.env);
      const allCollections = await this._fetchCollections(nocoClient, activeRules);

      const { ruleCollections, discountCollectionIds } = this._buildRuleCollectionsMap(allCollections);

      await this._processDiamondBatches({
        db,
        nocoClient,
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
    const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();

    return {
      haravanApi: new HaravanAPI(HRV_API_KEY),
      db: Database.instance(this.env),
      nocoClient: new NocoDBClient(this.env)
    };
  }

  async _fetchCollections(nocoClient, activeRules) {
    const uniquePercents = [...new Set(activeRules.map(r => r.discount_percent))];

    if (uniquePercents.length === 0) {
      return { list: [] };
    }

    const where = `(discount_type,eq,percent)~and(discount_value,in,${uniquePercents.join(",")})`;
    return await nocoClient.listRecords(DiamondCollectService.HARAVAN_COLLECTIONS_TABLE, {
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
    const { db, nocoClient } = context;
    let offset = 0;
    const limit = 100;

    while (true) {
      const diamonds = await this._fetchDiamonds(db, limit, offset);

      if (!diamonds || diamonds.length === 0) {
        break;
      }

      const diamondIds = diamonds.map(d => d.id);
      const diamondCollectionsMap = {};

      if (diamondIds.length > 0) {
        const where = `(diamond_id,in,${diamondIds.join(",")})`;
        let entriesOffset = 0;
        const entriesLimit = 1000;

        while (true) {
          const relatedCollections = await nocoClient.listRecords(DiamondCollectService.DIAMONDS_HARAVAN_COLLECTION_TABLE, {
            where,
            limit: entriesLimit,
            offset: entriesOffset
          });

          const list = relatedCollections.list || [];

          for (const entry of list) {
            if (!diamondCollectionsMap[entry.diamond_id]) {
              diamondCollectionsMap[entry.diamond_id] = [];
            }
            diamondCollectionsMap[entry.diamond_id].push(entry);
          }

          if (list.length < entriesLimit) {
            break;
          }

          entriesOffset += entriesLimit;
        }
      }

      for (const diamond of diamonds) {
        await this._processSingleDiamond(diamond, context, diamondCollectionsMap[diamond.id] || []);
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

  async _processSingleDiamond(diamond, context, existingEntries) {
    try {
      const { activeRules, ruleCollections, discountCollectionIds, nocoClient, haravanApi } = context;

      const discountPercent = DiamondDiscountService.calculateDiscountPercent({
        diamondSize: parseFloat(diamond.edge_size_2 || 0),
        rules: activeRules
      });

      const rules = ruleCollections[discountPercent] || {};
      const targetNocodbCollectionId = rules.nocodbId || null;

      await this._syncNocoDBCollections(diamond, targetNocodbCollectionId, discountCollectionIds, nocoClient, existingEntries);
      await this._syncHaravanCollections(diamond, targetNocodbCollectionId, rules.haravanId, nocoClient, haravanApi, existingEntries);

    } catch (error) {
      if (this._isIgnorableError(error)) {
        return;
      }
      console.warn("Error processing diamond:", diamond.id, error);
      Sentry.captureException(error);
    }
  }

  async _syncNocoDBCollections(diamond, targetCollectionId, discountCollectionIds, nocoClient, existingEntries) {
    const existingList = existingEntries || [];

    for (const entry of existingList) {
      const isDiscountCollection = discountCollectionIds.includes(entry.haravan_collection_id);
      const isCurrentCollection = entry.haravan_collection_id === targetCollectionId;

      if (isDiscountCollection && !isCurrentCollection) {
        console.warn("Removing discount collection for diamond:", diamond.id, entry.haravan_collection_id);
        await nocoClient.deleteRecords(DiamondCollectService.DIAMONDS_HARAVAN_COLLECTION_TABLE, [{
          diamond_id: diamond.id,
          haravan_collection_id: entry.haravan_collection_id
        }]);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
  }

  async _syncHaravanCollections(diamond, targetNocodbCollectionId, targetHaravanCollectionId, nocoClient, haravanApi, existingEntries) {
    if (!targetNocodbCollectionId) return;

    let exists = (existingEntries || []).some(entry => entry.haravan_collection_id === targetNocodbCollectionId);

    if (!exists) {
      try {
        console.warn("Adding discount collection for diamond:", diamond.id, targetNocodbCollectionId);
        await nocoClient.createRecords(DiamondCollectService.DIAMONDS_HARAVAN_COLLECTION_TABLE, {
          diamonds: { id: diamond.id },
          haravan_collections: { id: targetNocodbCollectionId }
        });
        // Delay for NocoDB creation
        await new Promise(resolve => setTimeout(resolve, 1000));
        exists = true;
      } catch (error) {
        if (this._isIgnorableError(error)) {
          exists = true;
        } else {
          throw error;
        }
      }
    }

    if (exists && targetHaravanCollectionId) {
      await this._createHaravanCollect(diamond, targetHaravanCollectionId, haravanApi);
    }
  }

  async _createHaravanCollect(diamond, haravanCollectionId, haravanApi) {
    try {
      await haravanApi.collect.createCollect({
        "product_id": parseInt(diamond.product_id),
        "collection_id": parseInt(haravanCollectionId)
      });
    } catch (hrvError) {
      if (hrvError.response?.status === 422) {
        // Ignored 422 (likely exists)
      } else {
        throw hrvError;
      }
    }
    // Delay for Haravan rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  _isIgnorableError(error) {
    const errorData = error.response?.data;
    return errorData?.code === "23505" || errorData?.message === "This record already exists.";
  }
}
