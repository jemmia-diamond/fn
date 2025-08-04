import Database from "services/database";
import FrappeClient from "frappe/frappe-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class EmployeeService {
  constructor(env) {
    this.env = env;
    this.doctype = "Employee";
    this.frappeClient = new FrappeClient(
      {
        url: env.JEMMIA_ERP_BASE_URL,
        apiKey: env.JEMMIA_ERP_API_KEY,
        apiSecret: env.JEMMIA_ERP_API_SECRET
      }
    );
    this.db = Database.instance(env);
  }

  static async syncEmployeesToDatabase(env) {
    const timeThreshold = dayjs().subtract(1, "day").utc().format("YYYY-MM-DD HH:mm:ss");
    const emmployeeService = new EmployeeService(env);
    const employees = await emmployeeService.frappeClient.getList("Employee", {
      limit_page_length: 100,
      filters: [
        ["modified", ">=", timeThreshold]
      ]
    });
    for (const employee of employees) {
      await emmployeeService.db.erpnextEmployee.upsert({
        where: {
          name: employee.name
        },
        update: {},
        create: {
          name: employee.name,
          user_id: employee.user_id
        }
      });
    }
  }
}
