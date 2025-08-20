import LarksuiteService from "services/larksuite/lark";
import Database from "services/database";
import { TABLES } from "services/larksuite/docs/constant";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class RecordService {
  static async syncRecordsToDatabase(env) {
    const db = Database.instance(env);
    const larkClient = LarksuiteService.createClient(env);
    const timeThreshold = dayjs().utc().subtract(1, "day").subtract(5, "minutes").valueOf();
    const pageSize = 100;

    const tables = [
      TABLES.DEBT_TRACKING
    ];

    const allRecords = [];

    for (const table of tables) {
      const payload = {
        path: {
          app_token: table.app_token,
          table_id: table.table_id
        },
        params: {
          user_id_type: "user_id"
        },
        data: {
          filter: {
            conjunction: "and",
            conditions: [{
              field_name: "Last Modified Date",
              operator: "isGreater",
              value: ["ExactDate", timeThreshold]
            }]
          }
        }
      };
      const responses = await LarksuiteService.requestWithPagination(larkClient.bitable.appTableRecord.search, payload, pageSize);
      const records = responses.flatMap(res => (res?.data?.items ?? []));
      const recordsWithTableMetaData = records.map(record => {
        return {
          ...record,
          table_id: table.table_id,
          app_token: table.app_token
        };
      });
      allRecords.push(...recordsWithTableMetaData);
    }
    
    for (const record of allRecords) {
      await db.larksuiteRecord.upsert({
        where: {
          record_id: record.record_id
        },
        update: {
          fields: record.fields
        },
        create: {
          record_id: record.record_id,
          table_id: record.table_id,
          app_token: record.app_token,
          fields: record.fields
        }
      });
    }
  }

  /**
   * Retrieves a single record from a Larksuite table.
   *
   * @param {string} env - The environment configuration.
   * @param {string} appToken - The app token of the Larksuite application.
   * @param {string} tableId - The table ID of the table containing the record.
   * @param {string} recordId - The ID of the record to retrieve.
   * @param {string} userIdType - The type of user ID to use (default is "user_id").
   * @returns {Promise<object|null>} - The record object if found, otherwise null.
   */
  static async getLarksuiteRecord({
    env, appToken, tableId, recordId, userIdType = "open_id"
  }) {
    const larkClient = LarksuiteService.createClient(env);

    try {
      const response = await larkClient.bitable.appTableRecord.get({
        path: {
          app_token: appToken,
          table_id: tableId,
          record_id: recordId
        },
        params: {
          user_id_type: userIdType
        }
      });

      return response.data.record;
    } catch (error) {
      console.error("Error retrieving Larksuite record:", error);
      return null;
    }
  }

  /**
   * Updates a single record in a Larksuite table.
   *
   * @param {string} env - The environment configuration.
   * @param {string} appToken - The app token of the Larksuite application.
   * @param {string} tableId - The table ID of the table containing the record.
   * @param {string} recordId - The ID of the record to update.
   * @param {object} fields - An object containing the fields to update and their new values.
   * @param {string} userIdType - The type of user ID to use (default is "user_id").
   * @returns {Promise<object|null>} - The updated record object if successful, otherwise null.
   */
  static async updateLarksuiteRecord({
    env, appToken, tableId, recordId, fields, userIdType = "open_id"
  }) {
    const larkClient = LarksuiteService.createClient(env);

    try {
      const response = await larkClient.bitable.appTableRecord.update({
        path: {
          app_token: appToken,
          table_id: tableId,
          record_id: recordId
        },
        params: {
          user_id_type: userIdType
        },
        data: {
          fields: fields
        }
      });

      return response.data.record;
    } catch (error) {
      console.error("Error updating Larksuite record:", error);
      return null;
    }
  }
}

