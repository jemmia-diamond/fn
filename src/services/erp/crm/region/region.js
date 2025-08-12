import FrappeClient from "frappe/frappe-client";
import Database from "services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class RegionService {
  static ERPNEXT_PAGE_SIZE = 100;
  constructor(env) {
    this.env = env;
    this.doctype = "Region";
    this.frappeClient = new FrappeClient(
      {
        url: env.JEMMIA_ERP_BASE_URL,
        apiKey: env.JEMMIA_ERP_API_KEY,
        apiSecret: env.JEMMIA_ERP_API_SECRET
      }
    );
    this.db = Database.instance(env);
  }

  static async syncRegionsToDatabase(env) {
    console.log("*** Starting sync regions to database");
    const timeThreshold = dayjs().subtract(1000, "day").utc().format("YYYY-MM-DD HH:mm:ss");
    const regionService = new RegionService(env);
    const regions = await regionService.frappeClient.getList("Region", {
      limit_page_length: RegionService.ERPNEXT_PAGE_SIZE,
      filters: [
        ["modified", ">=", timeThreshold]
      ]
    });
    if (regions.length > 0) {
      for (const region of regions) {
        await regionService.db.erpnextRegion.upsert({
          where: {
            name: region.name
          },
          update: {
            name: region.name,
            owner: region.owner,
            creation: new Date(region.creation),
            modified: new Date(region.modified),
            region_name: region.region_name
          },
          create: {
            name: region.name,
            owner: region.owner,
            creation: new Date(region.creation),
            modified: new Date(region.modified),
            region_name: region.region_name
          }
        });
      }
    }
  }
}