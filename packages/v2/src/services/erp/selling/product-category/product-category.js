import FrappeClient from "frappe/frappe-client";
import Database from "services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class ProductCategoryService {
  static ERPNEXT_PAGE_SIZE = 100;
  constructor(env) {
    this.env = env;
    this.doctype = "Product Category";
    this.frappeClient = new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET,
    });
    this.db = Database.instance(env);
  }

  static async syncProductCategoryToDatabase(env) {
    const timeThreshold = dayjs()
      .subtract(1, "day")
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
    const productCategoryService = new ProductCategoryService(env);

    let productCategories = [];
    let page = 1;
    const pageSize = ProductCategoryService.ERPNEXT_PAGE_SIZE;
    while (true) {
      const result = await productCategoryService.frappeClient.getList(
        productCategoryService.doctype,
        {
          limit_start: (page - 1) * pageSize,
          limit_page_length: pageSize,
          filters: [["modified", ">=", timeThreshold]],
        },
      );
      productCategories = productCategories.concat(result);
      if (result.length < pageSize) break;
      page++;
    }

    for (const productCategory of productCategories) {
      const productCategoryData = {
        name: productCategory.name,
        owner: productCategory.owner,
        creation: productCategory.creation
          ? new Date(productCategory.creation)
          : null,
        modified: productCategory.modified
          ? new Date(productCategory.modified)
          : null,
        modified_by: productCategory.modified_by,
        docstatus: productCategory.docstatus,
        idx: productCategory.idx,
        title: productCategory.title,
      };
      await productCategoryService.db.erpnextProductCategory.upsert({
        where: {
          name: productCategoryData.name,
        },
        update: productCategoryData,
        create: productCategoryData,
      });
    }
  }
}
