import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import Database from "services/database";
import { TABLES, VARIANTS_V2_FIELDS } from "services/larksuite/docs/constant";
import RecordService from "services/larksuite/docs/base/record/record";

dayjs.extend(utc);

const TIME_INTERVAL_MINUTES = 60;
const BATCH_SIZE = 20;
const LARK_BATCH_SIZE = 500;

export default class VariantSyncService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.tableConfig = {
      table_id: env?.LARK_VARIANTS_TABLE_ID || TABLES.VARIANTS_V2.table_id,
      app_token: env?.LARK_VARIANTS_APP_TOKEN || TABLES.VARIANTS_V2.app_token
    };
  }

  async sync({ limit = null, offset = null, updatedAtMin = null } = {}) {
    const nowUtc = dayjs().utc();
    const defaultUpdatedAtMin = nowUtc.subtract(TIME_INTERVAL_MINUTES, "minutes").toDate();
    const finalUpdatedAtMin = updatedAtMin || defaultUpdatedAtMin;
    const variants = await this._fetchUpdatedVariants(finalUpdatedAtMin, limit, offset);
    if (!variants?.length) return;

    const larkVariants = await this._fetchLarkVariants(variants);
    const larkVariantMap = this._buildLarkVariantMap(larkVariants);
    const { newVariants, oldVariants } = this._categorizeVariants(variants, larkVariantMap);

    if (newVariants.length) await this._createLarkRecords(newVariants);
    if (oldVariants.length) await this._updateLarkRecords(oldVariants);
  }

  async _fetchUpdatedVariants(updatedAtMin, limit = null, offset = null) {
    const options = {
      where: {
        OR: [
          { updated_at: { gte: updatedAtMin } },
          { wv_database_updated_at: { gte: updatedAtMin } }
        ]
      }
    };

    if (limit !== null) options.take = limit;
    if (offset !== null) options.skip = offset;

    return await this.db.larksuiteLarkVariantsView.findMany(options);
  }

  async _fetchLarkVariants(variants) {
    const allLarkVariants = [];

    for (let i = 0; i < variants.length; i += BATCH_SIZE) {
      const batch = variants.slice(i, i + BATCH_SIZE);
      const variantIds = batch.map(item => String(item.variant_id));
      const conditions = variantIds.map(vid => ({
        field_name: "variant_id",
        operator: "is",
        value: [vid]
      }));

      const filter = { conjunction: "or", conditions };
      const records = await RecordService.fetchRecords(this.env, this.tableConfig, {
        filter,
        pageSize: BATCH_SIZE
      });
      if (records?.length) allLarkVariants.push(...records);
    }

    return allLarkVariants;
  }

  _buildLarkVariantMap(larkVariants) {
    const map = {};
    for (const item of larkVariants) {
      const variantId = item.fields?.variant_id;
      if (variantId !== undefined && variantId !== null) {
        map[String(variantId)] = item.record_id;
      }
    }
    return map;
  }

  _categorizeVariants(variants, larkVariantMap) {
    const newVariants = [];
    const oldVariants = [];

    for (const variant of variants) {
      const larkRecordId = larkVariantMap[String(variant.variant_id)];
      if (larkRecordId) {
        oldVariants.push({ ...variant, lark_record_id: larkRecordId });
      } else {
        newVariants.push(variant);
      }
    }

    return { newVariants, oldVariants };
  }

  _composeLarkRecord(item) {
    const recordItem = {};
    for (const field of VARIANTS_V2_FIELDS) {
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

  async _createLarkRecords(variants) {
    const records = variants.map(variant => this._composeLarkRecord(variant));

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

  async _updateLarkRecords(variants) {
    const records = variants.map(variant => ({
      record_id: variant.lark_record_id,
      ...this._composeLarkRecord(variant)
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
