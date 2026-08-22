import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import Database from "services/database";
import RecordService from "services/larksuite/docs/base/record/record";
import { SERIAL_NUMBERS_FIELDS, TABLES } from "services/larksuite/docs/constant";

dayjs.extend(utc);

const TIME_INTERVAL_MINUTES = 600;
const BATCH_SIZE = 20;
const LARK_BATCH_SIZE = 500;

export default class SerialSyncService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.tableConfig = {
      table_id: env?.LARK_SERIAL_TABLE_ID || TABLES.SERIAL_NUMBERS.table_id,
      app_token: env?.LARK_SERIAL_APP_TOKEN || TABLES.SERIAL_NUMBERS.app_token
    };
  }

  async sync({ limit = null, offset = null, updatedAtMin = null } = {}) {
    const nowUtc = dayjs().utc();
    const defaultUpdatedAtMin = nowUtc.subtract(TIME_INTERVAL_MINUTES, "minutes").toDate();
    const finalUpdatedAtMin = updatedAtMin || defaultUpdatedAtMin;
    const serials = await this._fetchUpdatedSerials(finalUpdatedAtMin, limit, offset);
    if (!serials?.length) return;

    const larkSerials = await this._fetchLarkSerials(serials);
    const larkSerialMap = this._buildLarkSerialMap(larkSerials);
    const { newSerials, oldSerials } = this._categorizeSerials(serials, larkSerialMap);

    if (newSerials.length) await this._createLarkRecords(newSerials);
    if (oldSerials.length) await this._updateLarkRecords(oldSerials);
  }

  async _fetchUpdatedSerials(updatedAtMin, limit = null, offset = null) {
    const options = {
      where: {
        wvs_database_updated_at: {
          gte: updatedAtMin
        }
      }
    };

    if (limit !== null) options.take = limit;
    if (offset !== null) options.skip = offset;

    return await this.db.larksuiteSerialNumbersView.findMany(options);
  }

  async _fetchLarkSerials(serials) {
    const allLarkSerials = [];

    for (let i = 0; i < serials.length; i += BATCH_SIZE) {
      const batch = serials.slice(i, i + BATCH_SIZE);
      const serialIds = batch.map((item) => String(item.id));
      const conditions = serialIds.map((id) => ({
        field_name: "id",
        operator: "is",
        value: [id]
      }));

      const filter = { conjunction: "or", conditions };
      const records = await RecordService.fetchRecords(this.env, this.tableConfig, {
        filter,
        pageSize: BATCH_SIZE
      });
      if (records?.length) allLarkSerials.push(...records);
    }

    return allLarkSerials;
  }

  _buildLarkSerialMap(larkSerials) {
    const map = {};
    for (const item of larkSerials) {
      const serialId = item.fields?.id;
      if (serialId !== undefined && serialId !== null) {
        map[String(serialId)] = item.record_id;
      }
    }
    return map;
  }

  _categorizeSerials(serials, larkSerialMap) {
    const newSerials = [];
    const oldSerials = [];

    for (const serial of serials) {
      const larkRecordId = larkSerialMap[String(serial.id)];
      if (larkRecordId) {
        oldSerials.push({ ...serial, lark_record_id: larkRecordId });
      } else {
        newSerials.push(serial);
      }
    }

    return { newSerials, oldSerials };
  }

  _composeLarkRecord(item) {
    const recordItem = {};
    for (const field of SERIAL_NUMBERS_FIELDS) {
      const val = item[field];
      if (val === undefined || val === null) {
        recordItem[field] = null;
      } else if (
        typeof val === "number" ||
        typeof val === "bigint" ||
        (typeof val === "object" && typeof val.toNumber === "function")
      ) {
        const num = Number(val);
        recordItem[field] = Number.isNaN(num) ? 0 : num;
      } else if (val instanceof Date) {
        recordItem[field] = val.toISOString();
      } else {
        recordItem[field] = val;
      }
    }

    return recordItem;
  }

  async _createLarkRecords(serials) {
    const records = serials.map((serial) => this._composeLarkRecord(serial));

    for (let i = 0; i < records.length; i += LARK_BATCH_SIZE) {
      const chunk = records.slice(i, i + LARK_BATCH_SIZE);
      await RecordService.createLarksuiteRecords({
        env: this.env,
        appToken: this.tableConfig.app_token,
        tableId: this.tableConfig.table_id,
        records: chunk
      });
    }
  }

  async _updateLarkRecords(serials) {
    const records = serials.map((serial) => ({
      record_id: serial.lark_record_id,
      ...this._composeLarkRecord(serial)
    }));

    for (let i = 0; i < records.length; i += LARK_BATCH_SIZE) {
      const chunk = records.slice(i, i + LARK_BATCH_SIZE);
      await RecordService.updateLarksuiteRecords({
        env: this.env,
        appToken: this.tableConfig.app_token,
        tableId: this.tableConfig.table_id,
        records: chunk
      });
    }
  }
}
