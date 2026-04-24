import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { Prisma } from "@prisma-cli/client";
import Database from "services/database";
import { TABLES } from "services/larksuite/docs/constant";
import RecordService from "services/larksuite/docs/base/record/record";

dayjs.extend(utc);

const TIME_INTERVAL_MINUTES = 30;
const BATCH_SIZE = 20;
const LARK_BATCH_SIZE = 500;

export default class AccountingSalesOrderLarkSyncService {

  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.tableConfig = TABLES.ORDER_INFO;
  }

  async sync({ limit = null, offset = null, updatedAtMin = null } = {}) {
    const now = dayjs().utc();
    const defaultUpdatedAtMin = now.subtract(TIME_INTERVAL_MINUTES, "minutes").toDate();
    const finalUpdatedAtMin = updatedAtMin || defaultUpdatedAtMin;
    const orders = await this._fetchUpdatedOrders(finalUpdatedAtMin, limit, offset);

    if (!orders || orders.length === 0) return;

    const larkOrders = await this._fetchLarkOrders(orders);
    const larkOrderMap = this._buildLarkOrderMap(larkOrders);
    const { newOrders, existingOrders } = this._categorizeOrders(orders, larkOrderMap);

    if (newOrders.length > 0) await this._createLarkRecords(newOrders);
    if (existingOrders.length > 0) await this._updateLarkRecords(existingOrders);
  }

  async _fetchUpdatedOrders(updatedAtMin, limit = null, offset = null) {
    const clauses = [Prisma.sql`updated_at >= ${updatedAtMin}`];

    if (limit !== null) clauses.push(Prisma.sql`LIMIT ${limit}`);
    if (offset !== null) clauses.push(Prisma.sql`OFFSET ${offset}`);

    const query = Prisma.sql`
      SELECT * FROM haravan.accounting_sales_order_view
      WHERE ${Prisma.join(clauses, Prisma.raw(" "))}
    `;

    return await this.db.$queryRaw(query);
  }

  async _fetchLarkOrders(orders) {
    const allLarkOrders = [];

    for (let i = 0; i < orders.length; i += BATCH_SIZE) {
      const batch = orders.slice(i, i + BATCH_SIZE);
      const orderIds = batch.map(order => String(order.id));
      const conditions = orderIds.map(id => ({
        field_name: "id", operator: "is", value: [id]
      }));

      const filter = { conjunction: "or", conditions };
      const records = await RecordService.fetchRecords(this.env, this.tableConfig, {
        filter, pageSize: BATCH_SIZE
      });
      allLarkOrders.push(...records);
    }
    return allLarkOrders;
  }

  _buildLarkOrderMap(larkOrders) {
    const map = {};
    for (const order of larkOrders) {
      const orderId = order.fields?.id;
      if (orderId) map[String(orderId)] = order.record_id;
    }
    return map;
  }

  _categorizeOrders(orders, larkOrderMap) {
    const newOrders = [];
    const existingOrders = [];

    for (const order of orders) {
      const larkRecordId = larkOrderMap[String(order.id)];
      if (larkRecordId) {
        existingOrders.push({ ...order, lark_record_id: larkRecordId });
        continue;
      }
      newOrders.push(order);
    }

    return { newOrders, existingOrders };
  }

  async _createLarkRecords(orders) {
    const records = orders.map(order => this._mapOrderToLarkFields(order));

    for (let i = 0; i < records.length; i += LARK_BATCH_SIZE) {
      const chunk = records.slice(i, i + LARK_BATCH_SIZE);
      await RecordService.createLarksuiteRecords({
        env: this.env,
        appToken: this.tableConfig.app_token,
        tableId: this.tableConfig.table_id,
        records: chunk
      });
    }
  }

  async _updateLarkRecords(orders) {
    const records = orders.map(order => ({
      record_id: order.lark_record_id,
      ...this._mapOrderToLarkFields(order)
    }));

    for (let i = 0; i < records.length; i += LARK_BATCH_SIZE) {
      const chunk = records.slice(i, i + LARK_BATCH_SIZE);
      await RecordService.updateLarksuiteRecords({
        env: this.env,
        appToken: this.tableConfig.app_token,
        tableId: this.tableConfig.table_id,
        records: chunk
      });
    }
  }

  _mapOrderToLarkFields(order) {
    return {
      id: order.id ? Number(order.id) : null,
      created_at: order.created_at ? dayjs(order.created_at).toISOString() : null,
      updated_at: order.updated_at ? dayjs(order.updated_at).toISOString() : null,
      name: order.name,
      real_created_at: order.real_created_at ? dayjs(order.real_created_at).toISOString() : null,
      customer_type: order.customer_type,
      fulfillment_status: order.fulfillment_status,
      cancelled_status: order.cancelled_status,
      total_price: order.total_price ? parseFloat(order.total_price) : 0,
      assigned_location_name: order.assigned_location_name,
      purpose_label: order.purpose_label,
      delivery_location_value: order.delivery_location_value,
      source: order.source,
      _total_data_item: order.total_data_item,
      first_channel_label: order.first_channel_label,
      name_value: order.name_value,
      status: order.status,
      fulfillment_created_at: order.fulfillment_created_at ? dayjs(order.fulfillment_created_at).toISOString() : null,
      cancelled_at: order.cancelled_at ? dayjs(order.cancelled_at).toISOString() : null
    };
  }
}
