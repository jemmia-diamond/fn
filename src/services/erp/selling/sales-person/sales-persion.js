import FrappeClient from "frappe/frappe-client";
import Database from "services/database";

export default class SalesPersonService {
  constructor(env) {
    this.env = env;
    this.doctype = "Sales Person";
    this.frappeClient = new FrappeClient(
      {
        url: env.JEMMIA_ERP_BASE_URL,
        apiKey: env.JEMMIA_ERP_API_KEY,
        apiSecret: env.JEMMIA_ERP_API_SECRET
      }
    );
    this.db = Database.instance(env);
  }

  static async syncSalesPersonToDatabase(env) {
    const salesPersonService = new SalesPersonService(env);
    const salesPersons = await salesPersonService.frappeClient.getList("Sales Person", {
      limit_page_length: 100
    });
    for (const salesPerson of salesPersons) {
      await salesPersonService.db.erpnextSalesPerson.upsert({
        where: {
          name: salesPerson.name,
        },
        update: {},
        create: {
          name: salesPerson.name,
          employee: salesPerson.employee
        }
      })
    }
  }
}
