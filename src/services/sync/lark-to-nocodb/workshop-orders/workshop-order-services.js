import * as Sentry from "@sentry/cloudflare";
import { RecordConnector } from "services/clients/lark-client/docs";
import NocoDBClient from "services/clients/nocodb-client";
import { LARK_APP_TOKEN, LARK_TABLE_ID, NOCODB_TABLE_ID, POLICY_FIELDS, SERIAL_NUMBER, LAST_UPDATED_AT } from "services/sync/lark-to-nocodb/workshop-orders/constants";

const KV_KEY = "workshop_order_sync:last_date";
const FIELDS = [SERIAL_NUMBER, POLICY_FIELDS, LAST_UPDATED_AT];

export default class WorkshopOrderServices {
  static SYNC_TYPE_MANUAL = "MANUAL";
  static SYNC_TYPE_AUTO = "AUTO";
  static PAGE_SIZE = 100;

  constructor(env) {
    this.env = env;
    this.larkClient = new RecordConnector(env);
    this.nocoClient = new NocoDBClient(env);
    this.kv = env.FN_KV;
  }

  static async cronJobSyncLarkToNocoDB(env) {
    const service = new WorkshopOrderServices(env);
    return await service.syncLarkToNocoDB({
      isSyncType: WorkshopOrderServices.SYNC_TYPE_AUTO,
      hoursBack: 3
    });
  }

  async syncLarkToNocoDB(options = {}) {
    const { isSyncType = WorkshopOrderServices.SYNC_TYPE_MANUAL, hoursBack = 3 } = options;
    const currentRunTime = Date.now();
    let timestamp;

    if (isSyncType === WorkshopOrderServices.SYNC_TYPE_AUTO) {
      const lastDate = await this.kv.get(KV_KEY);
      timestamp = lastDate ? parseInt(lastDate) : (currentRunTime - (hoursBack * 60 * 60 * 1000));
    } else {
      timestamp = currentRunTime - (hoursBack * 60 * 60 * 1000);
    }

    try {
      await this._fetchAndProcess(timestamp);

      if (isSyncType === WorkshopOrderServices.SYNC_TYPE_AUTO) {
        await this.kv.put(KV_KEY, currentRunTime.toString());
      }
      return { msg: "Success" };

    } catch (error) {
      Sentry.captureException(error);
      // Self-Healing: If stuck for > 1 hour, force update checkpoint to skip problematic range
      if (isSyncType === WorkshopOrderServices.SYNC_TYPE_AUTO) {
        const lastDate = await this.kv.get(KV_KEY);
        if (lastDate && (currentRunTime - parseInt(lastDate) > 60 * 60 * 1000)) {
          await this.kv.put(KV_KEY, currentRunTime.toString());
        }
      }
      return { msg: "Failed", error: error.message };
    }
  }

  async _fetchAndProcess(timestamp) {
    let hasMore = true, pageToken = null;

    while (hasMore) {
      // Fetch records from LarkBase
      const res = await this.larkClient.searchRecords(LARK_APP_TOKEN, LARK_TABLE_ID, {
        automatic_fields: true,
        fieldNames: FIELDS,
        pageSize: WorkshopOrderServices.PAGE_SIZE,
        pageToken,
        filter: {
          conjunction: "and",
          conditions: [
            { field_name: SERIAL_NUMBER, operator: "isNotEmpty", value: [] },
            { field_name: LAST_UPDATED_AT, operator: "isGreater", value: ["ExactDate", timestamp] }
          ]
        }
      });

      if (res.code !== 0) throw new Error(`Lark API Error: ${res.msg}`);

      const items = res.data.items || [];
      const recordsToSync = [];

      // Process items from larkbase
      if (items.length) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const lastUpdated = item.fields[LAST_UPDATED_AT];
          if (lastUpdated && lastUpdated <= timestamp) continue;

          const policy = item.fields[POLICY_FIELDS] || "";

          if (item.fields[SERIAL_NUMBER] && item.fields[SERIAL_NUMBER].value) {
            const fullSerialString = item.fields[SERIAL_NUMBER].value
              .map(segment => segment.text)
              .join("");

            const serialList = fullSerialString.split(",");
            // Select serial number and policy
            serialList.forEach(serial => {
              const cleanSerial = serial.trim();
              if (cleanSerial) {
                recordsToSync.push({
                  serialNumber: cleanSerial,
                  policy: policy
                });
              }
            });
          }
        }
        if (recordsToSync.length) {
          await this._upsertBatch(recordsToSync);
        }
      }

      hasMore = res.data.has_more;
      pageToken = res.data.page_token;
    }
  }

  async _upsertBatch(recordsToSync) {
    if (recordsToSync.length === 0) return;

    // Get all IDs for these serials
    const serials = recordsToSync.map(r => r.serialNumber).join(",");

    try {
      const searchData = await this.nocoClient.listRecords(NOCODB_TABLE_ID, {
        where: `(serial_number,in,${serials})`,
        limit: recordsToSync.length,
        fields: ["id", "serial_number"]
      });

      // Create Lookup Map: Serial -> Record
      const existingMap = new Map();
      if (searchData.list) {
        searchData.list.forEach(rec => existingMap.set(rec.serial_number, rec));
      }

      // Process Updates
      for (const record of recordsToSync) {
        const existingRecord = existingMap.get(record.serialNumber);

        if (existingRecord) {
          await this.nocoClient.updateRecords(NOCODB_TABLE_ID, {
            id: existingRecord.id,
            policy: record.policy
          });
        }
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }
}
