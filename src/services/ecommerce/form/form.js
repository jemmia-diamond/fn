import Database from "services/database";
import LeadService from "services/erp/crm/lead/lead";
import * as Sentry from "@sentry/cloudflare";

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

    try {
      const leadService = new LeadService(this.env);
      await leadService.processWebsiteLead(result);
    } catch (error) {
      Sentry.captureException(error);
    }

    return result;
  }
}
