import FrappeClient from "frappe/frappe-client";
import Database from "services/database";
import NocoDBClient from "services/clients/nocodb-client.js";

export default class SalesOrderItemService {
  DOCTYPE = "Sales Order Item";
  NOCO_DIAMOND_TABLE = "m4qggn3vyz5qyqi";
  NOCO_SERIAL_TABLE = "mm80xzmei7q85k7";
  constructor(env) {
    this.env = env;
    this.frappeClient = new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET
    });
    this.db = Database.instance(env);
    this.nocodbClient = new NocoDBClient(env);
  }

  async dequeueSalesOrderItemQueue(batch) {
    for (const message of batch.messages) {
      const body = message.body;
      await this.processItemPolicy(body.data);
    }
  }

  async processItemPolicy(itemData) {
    const { variant_id, variant_title, real_order_date, serial_numbers, name } = itemData;
    const defaultPolicy = "Chưa có chính sách";
    const isGiaItem = variant_title?.toUpperCase().startsWith("GIA");

    // Check if the item is a diamond
    if (isGiaItem) {
      const record = await this._findRecordInTable(this.NOCO_DIAMOND_TABLE, "variant_id", variant_id);
      const policy = record
        ? this.processDiamondPolicy(record.policy_rules, real_order_date, defaultPolicy)
        : defaultPolicy;
      return this.updatePolicy(name, policy);
    }

    // Check if the item not a diamond
    const serialNumber = serial_numbers?.split("\n")[0];
    if (!serialNumber) {
      return this.updatePolicy(name, defaultPolicy);
    }

    // Check if the item has serial number
    const record = await this._findRecordInTable(this.NOCO_SERIAL_TABLE, "serial_number", serialNumber);
    const policy = record ? this.processSerialPolicy(record.policy) : defaultPolicy;
    return this.updatePolicy(name, policy);
  }

  async _findRecordInTable(tableId, field, value) {
    const response = await this.nocodbClient.listRecords(tableId, {
      where: `(${field},eq,${value})`,
      limit: 1
    });
    const record = response.list?.[0] || null;
    return record;
  }

  async updatePolicy(name, policy) {
    await this.frappeClient.update({
      doctype: this.DOCTYPE,
      name,
      item_policy: policy,
      is_policy_locked: 1
    });
  }

  processSerialPolicy(value) {
    // Default policy if no policy is found
    const defaultPolicy = "Thu mua 80% - Thu đổi 85%";
    if (!value) return defaultPolicy;

    if (value.includes("-") && value.includes("%")) {
      const [buy, exchange] = value.split("-").map((v) => v.replace(/%/g, "").trim());
      if (!isNaN(buy) && !isNaN(exchange)) {
        return `Thu mua ${buy}% - Thu đổi ${exchange}%`;
      }
    }
    return value;
  }

  processDiamondPolicy(rules, orderDateStr, fallback) {
    if (!Array.isArray(rules) || rules.length === 0) return fallback;

    const orderDate = new Date(orderDateStr);
    if (isNaN(orderDate.getTime())) {
      return fallback;
    }

    const matchingRules = rules
      .map((rule) => this._parseRule(rule))
      .filter((parsed) => parsed && this._isDateInRange(orderDate, parsed.start, parsed.end))
      .map((parsed) => parsed.policy);

    return matchingRules.length > 0 ? matchingRules.join("\n") : fallback;
  }

  _parseRule(rule) {
    const parts = rule.split(":");
    if (parts.length < 3) return null;

    const dateRange = parts[1].trim();
    const policy = parts.slice(2).join(":").trim();

    const [startStr, ...endParts] = dateRange.split("-");
    const endStr = endParts.join("-");

    const start = this._parseVietnameseDate(startStr.trim());
    const end = this._parseVietnameseDate(endStr.trim());

    return start && end ? { start, end, policy } : null;
  }

  _parseVietnameseDate(dateStr) {
    if (dateStr === "Quá khứ") return new Date(0);
    if (dateStr === "Tương lai") return new Date(9999, 11, 31);

    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;

    const [day, month, year] = parts.map((p) => parseInt(p, 10));
    return new Date(year < 100 ? year + 2000 : year, month - 1, day);
  }

  _isDateInRange(date, start, end) {
    return date >= start && date <= end;
  }

}
