import FrappeClient from "frappe/frappe-client";
import Database from "services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class LeadDemandService {
  static ERPNEXT_PAGE_SIZE = 100;
  constructor(env) {
    this.env = env;
    this.doctype = "Lead Demand";
    this.frappeClient = new FrappeClient(
      {
        url: env.JEMMIA_ERP_BASE_URL,
        apiKey: env.JEMMIA_ERP_API_KEY,
        apiSecret: env.JEMMIA_ERP_API_SECRET
      }
    );
    this.db = Database.instance(env);
  }

  static async syncLeadDemandToDatabase(env) {
    console.log("*** Starting sync lead demand to database");
    const timeThreshold = dayjs().subtract(1, "day").utc().format("YYYY-MM-DD HH:mm:ss");
    const leadDemandService = new LeadDemandService(env);
    const leadDemands = await leadDemandService.frappeClient.getList("Lead Demand", {
      limit_page_length: LeadDemandService.ERPNEXT_PAGE_SIZE,
      filters: [
        ["modified", ">=", timeThreshold]
      ]
    });
    if (leadDemands.length > 0) {
      console.log(`*** Found ${leadDemands.length} lead demands to sync`);
      for (const leadDemand of leadDemands) {
        await leadDemandService.db.erpnextLeadDemand.upsert({
          where: {
            name: leadDemand.name
          },
          update: {
            name: leadDemand.name,
            owner: leadDemand.owner,
            creation: new Date(leadDemand.creation),
            modified: new Date(leadDemand.modified),
            demand_label: leadDemand.demand_label
          },
          create: {
            name: leadDemand.name,
            owner: leadDemand.owner,
            creation: new Date(leadDemand.creation),
            modified: new Date(leadDemand.modified),
            demand_label: leadDemand.demand_label
          }
        });
      }
    }
  }
}