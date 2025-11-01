import InventoryCMSClient from "services/inventory-cms/inventory-cms-client/inventory-cms-client";
import { COLLECTIONS } from "services/inventory-cms/collections/constant";
import { readItems } from "@directus/sdk";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import Database from "services/database";

dayjs.extend(utc);

export default class InventoryCheckLineService {
  static PAGE_SIZE = 50;
  static async syncInventoryCheckLineToDatabase(env) {
    const client = await InventoryCMSClient.createClient(env);
    const db = Database.instance(env);
    const timeThreshold = dayjs()
      .utc()
      .subtract(5, "hours")
      .subtract(5, "minutes")
      .format("YYYY-MM-DD HH:mm:ss");
    const queryObject = {
      filter: {
        date_created: {
          _gte: timeThreshold
        }
      },
      limit: InventoryCheckLineService.PAGE_SIZE,
      deep: { lines: { _limit: -1 } }
    };

    // paginate and upsert in batches of 100 per page
    let page = 1;
    const BATCH_SIZE = 100;
    const toData = (line) => ({
      status: line.status,
      user_created: line.user_created,
      date_created: line.date_created,
      user_updated: line.user_updated,
      date_updated: line.date_updated,
      product_name: line.product_name,
      product_id: line.product_id,
      variant_id: line.variant_id,
      count_in_book: line.count_in_book,
      count_for_real: line.count_for_real,
      checked_status: line.checked_status,
      sheet_id: line.sheet_id,
      variant_name: line.variant_name,
      product_image: line.product_image,
      sku: line.sku,
      count_extra_for_real: line.count_extra_for_real,
      barcode: line.barcode,
      category: line.category,
      count_in_ordered: line.count_in_ordered,
      rfid_tags: line.rfid_tags
    });
    try {
      while (true) {
        const items = await client.request(
          readItems(COLLECTIONS.INVENTORY_CHECK_LINE, { page, ...queryObject })
        );
        const count = Array.isArray(items) ? items.length : 0;
        if (count === 0) break;
        for (let i = 0; i < items.length; i += BATCH_SIZE) {
          const chunk = items.slice(i, i + BATCH_SIZE);
          for (const line of chunk) {
            await db.inventoryCMSInventoryCheckLine.upsert({
              where: { id: line.id },
              update: toData(line),
              create: { id: line.id, sort: line.sort, ...toData(line) }
            });
          }
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        page++;
      }
    } catch (error) {
      console.error(error);
    }
  }
}
