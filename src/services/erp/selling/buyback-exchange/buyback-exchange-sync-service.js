import FrappeClient from "frappe/frappe-client";
import Database from "services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { fetchChildRecordsFromERP } from "src/services/utils/sql-helpers";

dayjs.extend(utc);

const KV_KEY = "erp_buyback_exchange_sync:last_date";
const DEFAULT_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";
const MINUTES_BACK = 10;
const PAGE_SIZE = 100;

export default class BuybackExchangeSyncService {
  constructor(env) {
    this.env = env;
    this.frappeClient = new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET
    });
    this.db = Database.instance(env);
    this.kv = env.FN_KV;
  }

  async fetchBuybackExchanges(fromDate, toDate) {
    let allRecords = [];
    let page = 1;

    while (true) {
      const batch = await this.frappeClient.getList("Buyback Exchange", {
        filters: [["modified", "between", [fromDate, toDate]]],
        limit_start: (page - 1) * PAGE_SIZE,
        limit_page_length: PAGE_SIZE,
        order_by: "modified asc"
      });
      allRecords = allRecords.concat(batch);
      if (batch.length < PAGE_SIZE) break;
      page++;
    }

    return allRecords;
  }

  async fetchBuybackExchangeItems(parentNames) {
    if (!parentNames.length) return [];
    return await fetchChildRecordsFromERP(this.frappeClient, parentNames, "tabBuyback Exchange Item");
  }

  async upsertBuybackExchange(record) {
    const data = {
      name: record.name,
      owner: record.owner || null,
      creation: record.creation ? new Date(record.creation) : null,
      modified: record.modified ? new Date(record.modified) : null,
      modified_by: record.modified_by || null,
      docstatus: record.docstatus ?? null,
      idx: record.idx ?? null,
      lark_instance_id: record.lark_instance_id || null,
      instance_type: record.instance_type || null,
      status: record.status || null,
      submitted_date: record.submitted_date ? new Date(record.submitted_date) : null,
      customer_name: record.customer_name || null,
      phone_number: record.phone_number || null,
      national_id: record.national_id || null,
      order_code: record.order_code || null,
      new_order_code: record.new_order_code || null,
      refund_amount: record.refund_amount ?? null,
      reason: record.reason || null,
      products_info: record.products_info || null,
      database_updated_at: new Date()
    };

    await this.db.erpnextBuybackExchange.upsert({
      where: { name: data.name },
      update: data,
      create: data
    });
  }

  async upsertBuybackExchangeItem(item) {
    const data = {
      name: item.name,
      owner: item.owner || null,
      creation: item.creation ? new Date(item.creation) : null,
      modified: item.modified ? new Date(item.modified) : null,
      modified_by: item.modified_by || null,
      docstatus: item.docstatus ?? null,
      idx: item.idx ?? null,
      product_name: item.product_name || null,
      item_code: item.item_code || null,
      order_code: item.order_code || null,
      prev_sales_order: item.prev_sales_order || null,
      prev_sales_order_item: item.prev_sales_order_item || null,
      current_sales_order: item.current_sales_order || null,
      sale_price: item.sale_price ?? null,
      buyback_percentage: item.buyback_percentage ?? null,
      calculated_buyback_price: item.calculated_buyback_price ?? null,
      buyback_price: item.buyback_price ?? null,
      parent: item.parent || null,
      parentfield: item.parentfield || null,
      parenttype: item.parenttype || null,
      database_updated_at: new Date()
    };

    await this.db.erpnextBuybackExchangeItem.upsert({
      where: { name: data.name },
      update: data,
      create: data
    });
  }

  async sync() {
    const toDate = dayjs().utc().format(DEFAULT_DATE_FORMAT);
    const lastDate = await this.kv.get(KV_KEY);
    const fromDate = lastDate || dayjs().utc().subtract(MINUTES_BACK, "minute").format(DEFAULT_DATE_FORMAT);

    try {
      const records = await this.fetchBuybackExchanges(fromDate, toDate);

      if (records.length > 0) {
        for (const record of records) {
          await this.upsertBuybackExchange(record);
        }
        const parentNames = records.map((r) => r.name);
        const items = await this.fetchBuybackExchangeItems(parentNames);
        for (const item of items) {
          await this.upsertBuybackExchangeItem(item);
        }
      }

      await this.kv.put(KV_KEY, toDate);
    } catch {
      const lastSaved = await this.kv.get(KV_KEY);
      if (lastSaved && dayjs(toDate).diff(dayjs(lastSaved), "hour") >= 1) {
        await this.kv.put(KV_KEY, toDate);
      }
      return;
    }
  }

  static async cronSync(env) {
    const service = new BuybackExchangeSyncService(env);
    return await service.sync();
  }
}
