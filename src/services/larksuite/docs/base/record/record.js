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
          user_id_type: "user_id",
        },
        data: {
          filter: {
            conjunction: "and",
            conditions: [{
              field_name: 'Last Modified Date',
              operator: 'isGreater',
              value: ['ExactDate', timeThreshold],
            }]
          }
        }
      }
      const responses = await LarksuiteService.requestWithAllPage(larkClient.bitable.appTableRecord.search, payload, pageSize);
      const records = responses.flatMap(res => res.data.items);
      const recordsWithTableMetaData = records.map(record => {
        return {
          ...record,
          table_id: table.table_id,
          app_token: table.app_token
        }
      })
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
      })
    }
  }
}

