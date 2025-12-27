import FrappeClient from "frappe/frappe-client";
import Database from "services/database";
import * as Sentry from "@sentry/cloudflare";

export default class SalesOrderItemService {
  constructor(env) {
    this.env = env;
    this.frappeClient = new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET
    });
    this.db = Database.instance(env);
  }

  async dequeueSalesOrderItemQueue(batch) {
    for (const message of batch.messages) {
      const body = message.body;
      try {
        await this.processItemPolicy(body.data);
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }

  async processItemPolicy(itemData) {
    try {
      console.log("Processing item policy");
      console.log(itemData);
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }
}
