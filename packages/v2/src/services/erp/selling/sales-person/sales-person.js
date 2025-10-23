import FrappeClient from "frappe/frappe-client";
import Database from "services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { fetchChildRecordsFromERP } from "src/services/utils/sql-helpers";

dayjs.extend(utc);

export default class SalesPersonService {
  static ERPNEXT_PAGE_SIZE = 100;
  constructor(env) {
    this.env = env;
    this.doctype = "Sales Person";
    this.frappeClient = new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET,
    });
    this.db = Database.instance(env);
  }

  static async syncSalesPersonToDatabase(env) {
    const timeThreshold = dayjs()
      .subtract(1, "day")
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
    const salesPersonService = new SalesPersonService(env);

    let salesPersons = [];
    let page = 1;
    const pageSize = SalesPersonService.ERPNEXT_PAGE_SIZE;
    while (true) {
      const result = await salesPersonService.frappeClient.getList(
        salesPersonService.doctype,
        {
          limit_start: (page - 1) * pageSize,
          limit_page_length: pageSize,
          filters: [["modified", ">=", timeThreshold]],
        },
      );
      salesPersons = salesPersons.concat(result);
      if (result.length < pageSize) break;
      page++;
    }
    const salesPersonNames = salesPersons.map(
      (salesPerson) => salesPerson.name,
    );
    const salesPersonChildRecords = await fetchChildRecordsFromERP(
      salesPersonService.frappeClient,
      salesPersonNames,
      "tabTarget Detail",
    );

    // group target details by sales person
    const salesPersonTargetsMap = {};
    salesPersonChildRecords.forEach((item) => {
      if (!salesPersonTargetsMap[item.parent]) {
        salesPersonTargetsMap[item.parent] = [];
      }
      salesPersonTargetsMap[item.parent].push(item);
    });

    // add target details to each sales person
    salesPersons.forEach((salesPerson) => {
      salesPerson.targets = salesPersonTargetsMap[salesPerson.name] || [];
    });

    for (const salesPerson of salesPersons) {
      const salesPersonData = {
        name: salesPerson.name,
        employee: salesPerson.employee,
        creation: new Date(salesPerson.creation),
        modified: new Date(salesPerson.modified),
        modified_by: salesPerson.modified_by,
        sales_person_name: salesPerson.sales_person_name,
        parent_sales_person: salesPerson.parent_sales_person,
        is_group: salesPerson.is_group,
        enabled: salesPerson.enabled,
        sales_region: salesPerson.sales_region,
        bizfly_id: salesPerson.bizfly_id,
        department: salesPerson.department,
        old_parent: salesPerson.old_parent,
        targets: salesPerson.targets,
      };
      await salesPersonService.db.erpnextSalesPerson.upsert({
        where: {
          name: salesPersonData.name,
        },
        update: salesPersonData,
        create: salesPersonData,
      });
    }
  }
}
