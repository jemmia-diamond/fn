import FrappeClient from "frappe/frappe-client";
import Database from "services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class ProvinceService {
  static ERPNEXT_PAGE_SIZE = 100;
  constructor(env) {
    this.env = env;
    this.doctype = "Province";
    this.frappeClient = new FrappeClient(
      {
        url: env.JEMMIA_ERP_BASE_URL,
        apiKey: env.JEMMIA_ERP_API_KEY,
        apiSecret: env.JEMMIA_ERP_API_SECRET
      }
    );
    this.db = Database.instance(env);
  }
  static async syncProvincesToDatabase(env) {
    const timeThreshold = dayjs().subtract(1, "day").utc().format("YYYY-MM-DD HH:mm:ss");
    const provinceService = new ProvinceService(env);
    const provinces = await provinceService.frappeClient.getList("Province", {
      limit_page_length: ProvinceService.ERPNEXT_PAGE_SIZE,
      filters: [
        ["modified", ">=", timeThreshold]
      ]
    });
    if (provinces.length > 0) {
      for (const province of provinces) {
        await provinceService.db.erpnextProvince.upsert({
          where: {
            name: province.name
          },
          update: {
            name: province.name,
            owner: province.owner,
            creation: new Date(province.creation),
            modified: new Date(province.modified),
            province_name: province.province_name,
            region: province.region
          },
          create: {
            name: province.name,
            owner: province.owner,
            creation: new Date(province.creation),
            modified: new Date(province.modified),
            province_name: province.province_name,
            region: province.region
          }
        });
      }
    }
  }
}
