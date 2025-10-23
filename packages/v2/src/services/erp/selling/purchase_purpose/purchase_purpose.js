import FrappeClient from "frappe/frappe-client";
import Database from "services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class PurchasePurposeService {
  static ERPNEXT_PAGE_SIZE = 100;
  constructor(env) {
    this.env = env;
    this.doctype = "Purchase Purpose";
    this.frappeClient = new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET,
    });
    this.db = Database.instance(env);
  }

  static async syncPurchasePurposeToDatabase(env) {
    const timeThreshold = dayjs()
      .subtract(1, "day")
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
    const purchasePurposeService = new PurchasePurposeService(env);

    let purchasePurposes = [];
    let page = 1;
    const pageSize = PurchasePurposeService.ERPNEXT_PAGE_SIZE;
    while (true) {
      const result = await purchasePurposeService.frappeClient.getList(
        purchasePurposeService.doctype,
        {
          limit_start: (page - 1) * pageSize,
          limit_page_length: pageSize,
          filters: [["modified", ">=", timeThreshold]],
        },
      );
      purchasePurposes = purchasePurposes.concat(result);
      if (result.length < pageSize) break;
      page++;
    }

    for (const purchasePurpose of purchasePurposes) {
      const purchasePurposeData = {
        name: purchasePurpose.name,
        owner: purchasePurpose.owner,
        creation: purchasePurpose.creation
          ? new Date(purchasePurpose.creation)
          : null,
        modified: purchasePurpose.modified
          ? new Date(purchasePurpose.modified)
          : null,
        modified_by: purchasePurpose.modified_by,
        docstatus: purchasePurpose.docstatus,
        idx: purchasePurpose.idx,
        title: purchasePurpose.title,
      };
      await purchasePurposeService.db.erpnextPurchasePurpose.upsert({
        where: {
          name: purchasePurposeData.name,
        },
        update: purchasePurposeData,
        create: purchasePurposeData,
      });
    }
  }
}
