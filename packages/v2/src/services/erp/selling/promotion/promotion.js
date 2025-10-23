import FrappeClient from "frappe/frappe-client";
import Database from "services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class PromotionService {
  static ERPNEXT_PAGE_SIZE = 100;
  constructor(env) {
    this.env = env;
    this.doctype = "Promotion";
    this.frappeClient = new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET,
    });
    this.db = Database.instance(env);
  }

  static async syncPromotionToDatabase(env) {
    const timeThreshold = dayjs()
      .subtract(1, "day")
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
    const promotionService = new PromotionService(env);

    let promotions = [];
    let page = 1;
    const pageSize = PromotionService.ERPNEXT_PAGE_SIZE;
    while (true) {
      const result = await promotionService.frappeClient.getList(
        promotionService.doctype,
        {
          limit_start: (page - 1) * pageSize,
          limit_page_length: pageSize,
          filters: [["modified", ">=", timeThreshold]],
        },
      );
      promotions = promotions.concat(result);
      if (result.length < pageSize) break;
      page++;
    }

    for (const promotion of promotions) {
      const promotionData = {
        name: promotion.name,
        owner: promotion.owner,
        creation: promotion.creation ? new Date(promotion.creation) : null,
        modified: promotion.modified ? new Date(promotion.modified) : null,
        modified_by: promotion.modified_by,
        docstatus: promotion.docstatus,
        idx: promotion.idx,
        title: promotion.title,
        scope: promotion.scope,
        is_active: promotion.is_active,
        is_expired: promotion.is_expired,
        priority: promotion.priority,
        discount_type: promotion.discount_type,
        discount_amount: promotion.discount_amount,
        discount_percent: promotion.discount_percent,
        start_date: promotion.start_date
          ? new Date(promotion.start_date)
          : null,
        end_date: promotion.end_date ? new Date(promotion.end_date) : null,
        description: promotion.description,
        bizfly_id: promotion.bizfly_id,
      };
      await promotionService.db.erpnextPromotion.upsert({
        where: {
          name: promotionData.name,
        },
        update: promotionData,
        create: promotionData,
      });
    }
  }
}
