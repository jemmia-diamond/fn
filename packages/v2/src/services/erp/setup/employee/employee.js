import Database from "services/database";
import FrappeClient from "frappe/frappe-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class EmployeeService {
  static ERPNEXT_PAGE_SIZE = 100;
  constructor(env) {
    this.env = env;
    this.doctype = "Employee";
    this.frappeClient = new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET
    });
    this.db = Database.instance(env);
  }

  static async syncEmployeesToDatabase(env) {
    const timeThreshold = dayjs()
      .subtract(1, "day")
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
    const employeeService = new EmployeeService(env);

    let employees = [];
    let page = 1;
    const pageSize = EmployeeService.ERPNEXT_PAGE_SIZE;
    while (true) {
      const result = await employeeService.frappeClient.getList(
        employeeService.doctype,
        {
          limit_start: (page - 1) * pageSize,
          limit_page_length: pageSize,
          filters: [["modified", ">=", timeThreshold]]
        }
      );
      employees = employees.concat(result);
      if (result.length < pageSize) break;
      page++;
    }

    for (const employee of employees) {
      const employeeData = {
        name: employee.name,
        user_id: employee.user_id,
        creation: new Date(employee.creation),
        modified: new Date(employee.modified),
        modified_by: employee.modified_by,
        employee_name: employee.employee_name,
        department: employee.department,
        status: employee.status,
        gender: employee.gender
      };
      await employeeService.db.erpnextEmployee.upsert({
        where: {
          name: employeeData.name
        },
        update: employeeData,
        create: employeeData
      });
    }
  }
}
