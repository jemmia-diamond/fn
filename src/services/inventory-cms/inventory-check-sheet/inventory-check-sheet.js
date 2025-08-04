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
}
