import Database from "services/database";
import LeadService from "services/erp/crm/lead/lead";

export default class FormService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  async create(rawData) {
    const result = await this.db.ecomLeads.create({
      data: {
        raw_data: rawData,
        source: rawData.source || "Website"
      },
      select: {
        custom_uuid: true,
        raw_data: true,
        source: true
      }
    });

    await this.createWebsiteLead(result);

    return result;
  }

  async createWebsiteLead(data) {
    const leadService = new LeadService(this.env);
    await leadService.processWebsiteLead(data);
  }
}
