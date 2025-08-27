import DirectusClient from "services/inventory-cms/directus-client/directus-client";
import { COLLECTIONS } from "services/inventory-cms/collections/constant";
import { readItems } from "@directus/sdk";
import Database from "services/database";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class InventoryCheckSheetService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  async processInventoryCheckSheetToDatabase(data) {
    const timestamp = dayjs(data.timestamp).utc().format("YYYY-MM-DD HH:mm:ss");
    const payload = data.payload;
    const sheetData = {
      id: uuidv4(),
      staff: payload.staff,
      count_in_book: payload.count_in_book,
      count_for_real: payload.count_for_real,
      extra: payload.extra,
      warehouse: payload.warehouse,
      warehouse_id: payload.warehouse_id,
      code: payload.code,
      created_at: timestamp,
      updated_at: timestamp,
      lines: JSON.stringify(payload.lines)
    };
    await this.db.$queryRaw`
        INSERT INTO inventory.inventory_check_sheets (id, staff, count_in_book, count_for_real, extra, warehouse, warehouse_id, code, created_at, updated_at, lines)
        VALUES ( ${sheetData.id}, ${sheetData.staff}, ${sheetData.count_in_book}, ${sheetData.count_for_real}, ${sheetData.extra}, ${sheetData.warehouse}, ${sheetData.warehouse_id}, ${sheetData.code}, ${sheetData.created_at}, ${sheetData.updated_at}, ${sheetData.lines});
      `;
  }

  static async syncInventoryCheckSheetToDatabase(env) {
    const client = await DirectusClient.createClient(env);
    const timeThreadhold = dayjs().utc().subtract(6, "hours").subtract(5, "minutes").format("YYYY-MM-DD HH:mm:ss");
    const queryObject = {
      filter: {
        date_created: {
          _gte: timeThreadhold
        }
      },
      limit: 100
    };

    // fetch all inventory check sheets created in the last 6 hours with pagination
    let page = 1;
    const inventoryCheckSheets = [];
    try {
      let items;
      do {
        items = await client.request(readItems(COLLECTIONS.INVENTORY_CHECK_SHEET, {
          page,
          ...queryObject
        }));
        inventoryCheckSheets.push(...items);
        page++;
      } while (items && items.length > 0);
    } catch (error) {
      console.error(error);
    }
  }
}
