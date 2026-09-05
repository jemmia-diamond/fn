import Database from "services/database";
import NocoDBClient from "services/clients/nocodb-client";
import * as Sentry from "@sentry/cloudflare";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";

const BATCH_SIZE = 100;

export default class VariantAttributesSyncService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  async sync() {
    try {
      const nocoClient = new NocoDBClient(this.env);
      await this.updateVariantAttributes(nocoClient);
      await this.updateDesignStockLocations(nocoClient);
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  async updateVariantAttributes(nocoClient) {
    const nocoVariants = await this._fetchNocoVariants(nocoClient);
    const validVariants = nocoVariants.filter(v => v.haravan_variant_id);

    if (validVariants.length === 0) return;

    const variantIds = validVariants.map(v => BigInt(v.haravan_variant_id));
    const hrvVariants = await this.db.haravan_variants.findMany({
      where: {
        id: {
          in: variantIds
        }
      },
      select: {
        id: true,
        qty_available: true,
        qty_commited: true,
        qty_incoming: true,
        qty_onhand: true
      }
    });

    const hrvVariantMap = new Map();
    for (const v of hrvVariants) {
      hrvVariantMap.set(String(v.id), v);
    }

    const updates = [];
    for (const nv of validVariants) {
      const hv = hrvVariantMap.get(String(nv.haravan_variant_id));
      if (!hv) continue;

      const qtyAvailableChanged = (nv.qty_available ?? null) !== (hv.qty_available ?? null);
      const qtyCommitedChanged = (nv.qty_commited ?? null) !== (hv.qty_commited ?? null);
      const qtyIncomingChanged = (nv.qty_incoming ?? null) !== (hv.qty_incoming ?? null);
      const qtyOnhandChanged = (nv.qty_onhand ?? null) !== (hv.qty_onhand ?? null);

      if (qtyAvailableChanged || qtyCommitedChanged || qtyIncomingChanged || qtyOnhandChanged) {
        updates.push({
          id: nv.id,
          qty_available: hv.qty_available ?? null,
          qty_commited: hv.qty_commited ?? null,
          qty_incoming: hv.qty_incoming ?? null,
          qty_onhand: hv.qty_onhand ?? null
        });
      }
    }

    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const chunk = updates.slice(i, i + BATCH_SIZE);
      await nocoClient.updateRecords(NOCODB_TABLES.SUPPLY.VARIANTS, chunk);
    }
  }

  async updateDesignStockLocations(nocoClient) {
    const inventories = await this.db.haravan_warehouse_inventories.findMany({
      where: {
        qty_onhand: {
          gt: 0n
        }
      },
      select: {
        product_id: true,
        loc_id: true
      }
    });

    const warehouses = await this.db.haravanWarehouses.findMany({
      select: {
        id: true,
        name: true
      }
    });

    const warehouseMap = new Map(warehouses.map(w => [String(w.id), w.name]));
    const productWarehouseNamesMap = new Map();
    for (const inv of inventories) {
      if (!inv.product_id || !inv.loc_id) continue;
      const whName = warehouseMap.get(String(inv.loc_id));
      if (!whName) continue;

      const prodKey = String(inv.product_id);
      if (!productWarehouseNamesMap.has(prodKey)) {
        productWarehouseNamesMap.set(prodKey, new Set());
      }
      productWarehouseNamesMap.get(prodKey).add(whName);
    }

    const nocoProducts = await this._fetchNocoProducts(nocoClient);
    const designLocationsMap = new Map();
    for (const prod of nocoProducts) {
      const designId = prod.design_id || prod.designs?.id || prod.designs;
      if (!designId || !prod.haravan_product_id) continue;

      const whNames = productWarehouseNamesMap.get(String(prod.haravan_product_id));
      if (whNames && whNames.size > 0) {
        const dKey = String(designId);
        if (!designLocationsMap.has(dKey)) {
          designLocationsMap.set(dKey, new Set());
        }
        for (const name of whNames) {
          designLocationsMap.get(dKey).add(name);
        }
      }
    }

    const nocoDesigns = await this._fetchNocoDesigns(nocoClient);
    const designUpdates = [];
    for (const design of nocoDesigns) {
      const namesSet = designLocationsMap.get(String(design.id));
      const newLocations = namesSet && namesSet.size > 0 ? Array.from(namesSet).join(",") : null;
      if ((design.stock_locations || null) !== newLocations) {
        designUpdates.push({
          id: design.id,
          stock_locations: newLocations
        });
      }
    }

    for (let i = 0; i < designUpdates.length; i += BATCH_SIZE) {
      const chunk = designUpdates.slice(i, i + BATCH_SIZE);
      await nocoClient.updateRecords(NOCODB_TABLES.SUPPLY.DESIGNS, chunk);
    }
  }

  async _fetchNocoVariants(nocoClient) {
    const list = [];
    let page = 1;
    const limit = 1000;
    while (true) {
      const res = await nocoClient.listRecords(NOCODB_TABLES.SUPPLY.VARIANTS, {
        limit,
        page,
        fields: ["id", "haravan_variant_id", "qty_available", "qty_commited", "qty_incoming", "qty_onhand"]
      });
      const batch = res.list || [];
      list.push(...batch);
      if (batch.length < limit) break;
      page++;
    }
    return list;
  }

  async _fetchNocoProducts(nocoClient) {
    const list = [];
    let page = 1;
    const limit = 1000;
    while (true) {
      const res = await nocoClient.listRecords(NOCODB_TABLES.SUPPLY.JEWELRIES, {
        limit,
        page,
        fields: ["id", "design_id", "haravan_product_id"]
      });
      const batch = res.list || [];
      list.push(...batch);
      if (batch.length < limit) break;
      page++;
    }
    return list;
  }

  async _fetchNocoDesigns(nocoClient) {
    const list = [];
    let page = 1;
    const limit = 1000;
    while (true) {
      const res = await nocoClient.listRecords(NOCODB_TABLES.SUPPLY.DESIGNS, {
        limit,
        page,
        fields: ["id", "stock_locations"]
      });
      const batch = res.list || [];
      list.push(...batch);
      if (batch.length < limit) break;
      page++;
    }
    return list;
  }
}
