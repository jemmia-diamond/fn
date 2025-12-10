import FrappeClient from "frappe/frappe-client";
import Database from "services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class LeadProductService {
  static ERPNEXT_PAGE_SIZE = 100;
  constructor(env) {
    this.env = env;
    this.doctype = "Lead Product";
    this.frappeClient = new FrappeClient(
      {
        url: env.JEMMIA_ERP_BASE_URL,
        apiKey: env.JEMMIA_ERP_API_KEY,
        apiSecret: env.JEMMIA_ERP_API_SECRET
      }
    );
    this.db = Database.instance(env);
  }

  static async syncLeadProductToDatabase(env) {
    const timeThreshold = dayjs().subtract(1, "day").utc().format("YYYY-MM-DD HH:mm:ss");
    const leadProductService = new LeadProductService(env);

    const leadProducts = [];
    let limitStart = 0;
    let hasMore = true;

    while (hasMore) {
      const pageResults = await leadProductService.frappeClient.getList("Lead Product", {
        filters: [["modified", ">=", timeThreshold]],
        limit_start: limitStart,
        limit_page_length: LeadProductService.ERPNEXT_PAGE_SIZE
      });

      leadProducts.push(...pageResults);

      if (pageResults.length < LeadProductService.ERPNEXT_PAGE_SIZE) {
        hasMore = false;
      } else {
        limitStart += LeadProductService.ERPNEXT_PAGE_SIZE;
      }
    }

    if (leadProducts.length > 0) {
      for (const leadProduct of leadProducts) {
        await leadProductService.db.erpnextLeadProduct.upsert({
          where: {
            name: leadProduct.name
          },
          update: {
            name: leadProduct.name,
            owner: leadProduct.owner,
            creation: new Date(leadProduct.creation),
            modified: new Date(leadProduct.modified),
            product_type: leadProduct.product_type
          },
          create: {
            name: leadProduct.name,
            owner: leadProduct.owner,
            creation: new Date(leadProduct.creation),
            modified: new Date(leadProduct.modified),
            product_type: leadProduct.product_type
          }
        });
      }
    }
  }
}
