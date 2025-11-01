import InventoryCMSClient from "services/inventory-cms/inventory-cms-client/inventory-cms-client";
import { COLLECTIONS } from "services/inventory-cms/collections/constant";
import { readItems } from "@directus/sdk";
import Database from "services/database";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class InventoryCheckSheetService {
  static PAGE_SIZE = 50;
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env, "neon");
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
    const client = await InventoryCMSClient.createClient(env);
    const db = Database.instance(env);

    const timeThreshold = dayjs()
      .utc()
      .subtract(3, "hours")
      .subtract(5, "minutes")
      .format("YYYY-MM-DD HH:mm:ss");
    const queryObject = {
      filter: {
        date_created: {
          _gte: timeThreshold
        }
      },
      limit: InventoryCheckSheetService.PAGE_SIZE,
      deep: { lines: { _limit: -1 } }
    };

    // fetch all inventory check sheets created in the last 6 hours with pagination
    let page = 1;
    const inventoryCheckSheets = [];
    try {
      let items;
      do {
        items = await client.request(
          readItems(COLLECTIONS.INVENTORY_CHECK_SHEET, {
            page,
            ...queryObject
          })
        );
        inventoryCheckSheets.push(...items);
        page++;
      } while (items && items.length > 0);
    } catch (error) {
      console.error(error);
    }

    for (const sheet of inventoryCheckSheets) {
      await db.inventoryCMSInventoryCheckSheet.upsert({
        where: {
          id: sheet.id
        },
        update: {
          status: sheet.status
        },
        create: {
          id: sheet.id,
          status: sheet.status,
          sort: sheet.sort,
          user_created: sheet.user_created,
          date_created: sheet.date_created,
          user_updated: sheet.user_updated,
          date_updated: sheet.date_updated,
          warehouse: sheet.warehouse,
          staff: sheet.staff,
          result: sheet.result,
          code: sheet.code,
          warehouse_id: sheet.warehouse_id,
          count_in_book: sheet.count_in_book,
          count_for_real: sheet.count_for_real,
          extra: sheet.extra,
          lines: sheet.lines
        }
      });
    }
  }
}
