import FrappeClient from "frappe/frappe-client";
import Database from "services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class LeadBudgetService {
  static ERPNEXT_PAGE_SIZE = 100;
  constructor(env) {
    this.env = env;
    this.doctype = "Lead Budget";
    this.frappeClient = new FrappeClient(
      {
        url: env.JEMMIA_ERP_BASE_URL,
        apiKey: env.JEMMIA_ERP_API_KEY,
        apiSecret: env.JEMMIA_ERP_API_SECRET
      }
    );
    this.db = Database.instance(env);
  }

  static async syncLeadBudgetsToDatabase(env) {
    const timeThreshold = dayjs().subtract(1, "day").utc().format("YYYY-MM-DD HH:mm:ss");
    const leadBudgetService = new LeadBudgetService(env);
    const leadBudgets = await leadBudgetService.frappeClient.getList("Lead Budget", {
      limit_page_length: LeadBudgetService.ERPNEXT_PAGE_SIZE,
      filters: [
        ["modified", ">=", timeThreshold]
      ]
    });
    if (leadBudgets.length > 0) {
      for (const leadBudget of leadBudgets) {
        await leadBudgetService.db.erpnextLeadBudget.upsert({
          where: {
            name: leadBudget.name
          },
          update: {
            name: leadBudget.name,
            owner: leadBudget.owner,
            creation: new Date(leadBudget.creation),
            modified: new Date(leadBudget.modified),
            budget_label: leadBudget.budget_label,
            budget_from: leadBudget.budget_from,
            budget_to: leadBudget.budget_to
          },
          create: {
            name: leadBudget.name,
            owner: leadBudget.owner,
            creation: new Date(leadBudget.creation),
            modified: new Date(leadBudget.modified),
            budget_label: leadBudget.budget_label,
            budget_from: leadBudget.budget_from,
            budget_to: leadBudget.budget_to
          }
        });
      }
    }
  }
}
