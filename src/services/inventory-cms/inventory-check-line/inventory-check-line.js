import InventoryCMSClient from "services/inventory-cms/inventory-cms-client/inventory-cms-client";
import { COLLECTIONS } from "services/inventory-cms/collections/constant";
import { readItems } from "@directus/sdk";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import Database from "services/database";

dayjs.extend(utc);

export default class InventoryCheckLineService {
  static async syncInventoryCheckLineToDatabase(env) {
    const client = await InventoryCMSClient.createClient(env);
    const db = Database.instance(env);
    const timeThreshold = dayjs().utc().subtract(5, "hours").subtract(5, "minutes").format("YYYY-MM-DD HH:mm:ss");
    const queryObject = {
      filter: {
        date_created: {
          _gte: timeThreshold
        }
      },
      limit: 1000
    };

    // fetch all inventory check lines created in the last 6 hours with pagination
    let page = 1;
    const inventoryCheckLines = [];
    try {
      let items;
      do {
        items = await client.request(readItems(COLLECTIONS.INVENTORY_CHECK_LINE, {
          page,
          ...queryObject
        }));
        inventoryCheckLines.push(...items);
        page++;
      } while (items && items.length > 0);
    } catch (error) {
      console.error(error);
    }

    for (const line of inventoryCheckLines.slice(0, 100)) {
      await db.inventoryCMSInventoryCheckLine.upsert({
        where: {
          id: line.id
        },
        update: {
          status: line.status
        },
        create: {
          id: line.id,
          status: line.status,
          sort: line.sort,
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
        }
      });
    }
  }
}
