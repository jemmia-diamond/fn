import DirectusClient from "services/inventory-cms/directus-client/directus-client";
import { COLLECTIONS } from "services/inventory-cms/collections/constant";
import { readItems } from "@directus/sdk";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class InventoryCheckLineService {
  static async syncInventoryCheckLineToDatabase(env) {
    const client = await DirectusClient.createClient(env);
    const timeThreadhold = dayjs().utc().subtract(5, "days").subtract(5, "minutes").format("YYYY-MM-DD HH:mm:ss");
    const queryObject = {
      filter: {
        date_created: {
          _gte: timeThreadhold
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
  }
}
