import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import Database from "services/database";
import { TABLES } from "services/larksuite/docs/constant";
import RecordService from "services/larksuite/docs/base/record/record";

dayjs.extend(utc);

const TIME_INTERVAL_MINUTES = 10;
const LARK_BATCH_SIZE = 500;
const DB_BATCH_SIZE = 50;

export default class WarehouseInventoryLarkSyncService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.dbConnection = {
      timeout: 60000,
      maxWait: 15000
    };
    this.tableConfig = {
      table_id: TABLES.WAREHOUSE_INVENTORIES.table_id,
      app_token: TABLES.WAREHOUSE_INVENTORIES.app_token
    };
  }

  async sync({ limit = null, offset = null, updatedAtMin = null } = {}) {
    const nowUtc = dayjs().utc();
    const defaultUpdatedAtMin = nowUtc
      .subtract(TIME_INTERVAL_MINUTES, "minutes")
      .toDate();
    const finalUpdatedAtMin = updatedAtMin || defaultUpdatedAtMin;

    const inventoryData = await this._fetchWarehouseInventories(
      finalUpdatedAtMin,
      limit,
      offset
    );
    if (!inventoryData?.length) return;

    const createdRecords = [];
    const updatedRecords = [];
    const { toCreate, toUpdate, toDelete } =
      this._categorizeInventories(inventoryData);

    if (toCreate?.length) {
      const res = await this._createLarkRecords(toCreate);
      createdRecords.push(...res);
    }

    if (toUpdate?.length) {
      const res = await this._updateLarkRecords(toUpdate);
      updatedRecords.push(...res);
    }

    const upsertList = [...createdRecords, ...updatedRecords];
    if (upsertList?.length) {
      await this._upsertLarkWarehouseInventories(upsertList);
    }

    if (toDelete?.length) {
      await this._deleteRecords(toDelete);
    }
  }

  async _fetchWarehouseInventories(updatedAtMin, limit = null, offset = null) {
    const options = {
      where: { database_updated_at: { gte: updatedAtMin } }
    };
    if (limit !== null) options.take = limit;
    if (offset !== null) options.skip = offset;

    const inventories =
      await this.db.haravan_warehouse_inventories.findMany(options);
    if (!inventories?.length) return [];

    const ids = inventories
      .map((item) => (item.id != null ? Number(item.id) : null))
      .filter((id) => id !== null);

    const larkInventories = await this.db.lark_warehouse_inventories.findMany({
      where: { id: { in: ids } },
      select: { id: true, lark_record_id: true }
    });

    const larkMap = new Map(
      larkInventories.map((item) => [item.id, item.lark_record_id])
    );

    return inventories.map((item) => ({
      ...item,
      lark_record_id:
        item.id != null ? larkMap.get(Number(item.id)) || null : null
    }));
  }

  _categorizeInventories(items) {
    const toCreate = [];
    const toUpdate = [];
    const toDelete = [];

    for (const item of items) {
      const isZero =
        !item.qty_onhand &&
        !item.qty_committed &&
        !item.qty_available &&
        !item.qty_incoming;

      if (isZero) {
        if (item.lark_record_id) toDelete.push(item);
        continue;
      }

      (item.lark_record_id ? toUpdate : toCreate).push(item);
    }

    return { toCreate, toUpdate, toDelete };
  }

  _mapInventoryToLarkFields(item) {
    return {
      id: Number(item.id) || null,
      loc_id: Number(item.loc_id) || null,
      product_id: Number(item.product_id) || null,
      variant_id: Number(item.variant_id) || null,
      qty_onhand: Number(item.qty_onhand || 0),
      qty_committed: Number(item.qty_committed || 0),
      qty_available: Number(item.qty_available || 0),
      qty_incoming: Number(item.qty_incoming || 0)
    };
  }

  async _createLarkRecords(items) {
    const createdRecords = [];
    const fieldsList = items.map((item) =>
      this._mapInventoryToLarkFields(item)
    );

    for (let i = 0; i < fieldsList.length; i += LARK_BATCH_SIZE) {
      const chunk = fieldsList.slice(i, i + LARK_BATCH_SIZE);
      const res = await RecordService.createLarksuiteRecords({
        env: this.env,
        appToken: this.tableConfig.app_token,
        tableId: this.tableConfig.table_id,
        records: chunk
      });

      const records = res?.data?.records || res?.records || [];
      for (let j = 0; j < records.length; j++) {
        const rec = records[j];
        const orig = chunk[j];
        const id = rec.fields?.id != null ? Number(rec.fields.id) : orig.id;
        if (id != null && rec.record_id) {
          createdRecords.push({
            id,
            lark_record_id: rec.record_id,
            qty_onhand: Number(rec.fields?.qty_onhand ?? orig.qty_onhand),
            qty_committed: Number(
              rec.fields?.qty_committed ?? orig.qty_committed
            ),
            qty_available: Number(
              rec.fields?.qty_available ?? orig.qty_available
            ),
            qty_incoming: Number(rec.fields?.qty_incoming ?? orig.qty_incoming)
          });
        }
      }
    }

    return createdRecords;
  }

  async _updateLarkRecords(items) {
    const updatedRecords = [];
    const payloads = items.map((item) => ({
      record_id: item.lark_record_id,
      ...this._mapInventoryToLarkFields(item)
    }));

    for (let i = 0; i < payloads.length; i += LARK_BATCH_SIZE) {
      const chunk = payloads.slice(i, i + LARK_BATCH_SIZE);
      const res = await RecordService.updateLarksuiteRecords({
        env: this.env,
        appToken: this.tableConfig.app_token,
        tableId: this.tableConfig.table_id,
        records: chunk
      });

      const records = res?.data?.records || res?.records || res || [];
      for (let j = 0; j < chunk.length; j++) {
        const orig = chunk[j];
        const rec = records[j];
        const recordId = rec?.record_id || orig.record_id;
        const id = rec?.fields?.id != null ? Number(rec.fields.id) : orig.id;
        if (id != null && recordId) {
          updatedRecords.push({
            id,
            lark_record_id: recordId,
            qty_onhand: Number(rec?.fields?.qty_onhand ?? orig.qty_onhand),
            qty_committed: Number(
              rec?.fields?.qty_committed ?? orig.qty_committed
            ),
            qty_available: Number(
              rec?.fields?.qty_available ?? orig.qty_available
            ),
            qty_incoming: Number(rec?.fields?.qty_incoming ?? orig.qty_incoming)
          });
        }
      }
    }

    return updatedRecords;
  }

  async _upsertLarkWarehouseInventories(records) {
    const validRecords = records.filter(
      (r) => r.id != null && r.lark_record_id
    );
    if (!validRecords.length) return;

    const currentDateTime = dayjs().utc().toDate();
    const toBigInt = (v) => (v != null ? BigInt(v) : null);

    for (let i = 0; i < validRecords.length; i += DB_BATCH_SIZE) {
      const chunk = validRecords.slice(i, i + DB_BATCH_SIZE);
      await this.db.$transaction(async (tx) => {
        const operations = chunk.map((r) => {
          const payload = {
            lark_record_id: r.lark_record_id,
            qty_onhand: toBigInt(r.qty_onhand),
            qty_committed: toBigInt(r.qty_committed),
            qty_available: toBigInt(r.qty_available),
            qty_incoming: toBigInt(r.qty_incoming),
            database_updated_at: currentDateTime
          };

          return tx.lark_warehouse_inventories.upsert({
            where: { id: Number(r.id) },
            create: {
              id: Number(r.id),
              ...payload,
              database_created_at: currentDateTime
            },
            update: payload
          });
        });
        await Promise.all(operations);
      }, this.dbConnection);
    }
  }

  async _deleteRecords(items) {
    const larkRecordIds = items
      .map((item) => item.lark_record_id)
      .filter(Boolean);
    const dbIds = items
      .map((item) => (item.id != null ? Number(item.id) : null))
      .filter(Boolean);

    if (larkRecordIds?.length) {
      for (let i = 0; i < larkRecordIds.length; i += LARK_BATCH_SIZE) {
        const chunk = larkRecordIds.slice(i, i + LARK_BATCH_SIZE);
        await RecordService.deleteLarksuiteRecords({
          env: this.env,
          appToken: this.tableConfig.app_token,
          tableId: this.tableConfig.table_id,
          records: chunk
        });
      }
    }

    if (dbIds?.length) {
      for (let i = 0; i < dbIds.length; i += DB_BATCH_SIZE) {
        const chunk = dbIds.slice(i, i + DB_BATCH_SIZE);
        await this.db.lark_warehouse_inventories.deleteMany({
          where: { id: { in: chunk } }
        });
      }
    }
  }
}
