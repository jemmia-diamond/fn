import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import Database from "services/database";
import HaravanAPI from "services/clients/haravan-client";
import OrderMapper from "services/haravan/orders/order-mapper";
import * as crypto from "crypto";
import { sleep } from "services/utils/sleep.js";
import { isTestOrder } from "services/utils/order-intercepter";

dayjs.extend(utc);

export default class OrderDatabaseSyncService {
  static RATE_LIMIT_DELAY_MS = 500;
  static MAX_RETRY_AFTER_SECONDS = 3;
  static DEFAULT_KV_KEY = "haravan_order_sync:last_date";

  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.dbConnection = {
      timeout: 80000,
      maxWait: 15000
    };
  }

  async sync() {
    const kv = this.env.FN_KV;
    const KV_KEY = OrderDatabaseSyncService.DEFAULT_KV_KEY;
    const toDate = dayjs().utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
    const lastSyncDate = await kv.get(KV_KEY);

    const fromDate = lastSyncDate
      ? dayjs(lastSyncDate).subtract(5, "minutes").format("YYYY-MM-DDTHH:mm:ss[Z]")
      : dayjs().utc().subtract(1, "hour").format("YYYY-MM-DDTHH:mm:ss[Z]");

    try {
      const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();
      const haravanClient = new HaravanAPI(HRV_API_KEY);

      await this._fetchAndProcessOrders(haravanClient, fromDate);
      await kv.put(KV_KEY, toDate);
    } catch {
      if (lastSyncDate && dayjs(toDate).diff(dayjs(lastSyncDate), "hour") >= 1) {
        await kv.put(KV_KEY, toDate);
      }
    }
  }

  async _fetchAndProcessOrders(haravanClient, updatedAtMin) {
    let page = 1;
    let hasMore = true;
    let skipNextSleep = false;
    const limit = 50;

    while (hasMore) {
      if (page > 1 && !skipNextSleep) {
        await sleep(OrderDatabaseSyncService.RATE_LIMIT_DELAY_MS);
      }
      skipNextSleep = false;

      try {
        const response = await haravanClient.order.getOrders({
          updated_at_min: updatedAtMin,
          page,
          limit
        });
        const orders = response?.orders || [];

        if (orders.length > 0) {
          await this._processOrderBatch(orders);
          page++;
        } else {
          hasMore = false;
        }
      } catch (error) {
        if (error.status === 429) {
          const retryAfter = parseFloat(error.retryAfter || 2);
          if (retryAfter > OrderDatabaseSyncService.MAX_RETRY_AFTER_SECONDS) {
            throw new Error(
              `Rate limited for ${retryAfter}s (exceeds ${OrderDatabaseSyncService.MAX_RETRY_AFTER_SECONDS}s threshold)`
            );
          }
          await sleep(retryAfter * 1000);
          skipNextSleep = true;
          continue;
        }
        throw error;
      }
    }
  }

  async _processOrderBatch(orders) {
    if (!orders || orders.length === 0) return;

    const validOrders = orders.filter(order => !isTestOrder(order));
    if (validOrders.length === 0) return;

    const lineItems = [];
    const refunds = [];
    const transactions = [];
    const fulfillments = [];

    for (const order of validOrders) {
      const orderId = order.id;

      for (const item of order.line_items || []) {
        lineItems.push({ ...item, order_id: orderId });
      }

      for (const refund of order.refunds || []) {
        refunds.push({ ...refund, order_id: orderId });
      }

      for (const transaction of order.transactions || []) {
        transactions.push(transaction);
      }

      for (const fulfillment of order.fulfillments || []) {
        fulfillments.push(fulfillment);
      }
    }

    await this._upsertOrders(validOrders);
    await this._upsertLineItems(lineItems);
    await this._upsertRefunds(refunds);
    await this._upsertTransactions(transactions);
    await this._upsertFulfillments(fulfillments);
  }

  async _upsertOrders(orders) {
    if (!orders || orders.length === 0) return;

    const currentDateTime = dayjs().utc().toDate();
    await this.db.$transaction(async (tx) => {
      const operations = orders.map(order => {
        const data = OrderMapper.mapOrder(order);
        const id = data.id;
        delete data.id;

        return tx.order.upsert({
          where: { id },
          create: {
            uuid: crypto.randomUUID(),
            id,
            ...data,
            database_created_at: currentDateTime,
            database_updated_at: currentDateTime
          },
          update: {
            ...data,
            database_updated_at: currentDateTime
          }
        });
      });
      await Promise.all(operations);
    }, this.dbConnection);
  }

  async _upsertLineItems(lineItems) {
    if (!lineItems || lineItems.length === 0) return;

    const currentDateTime = dayjs().utc().toDate();
    await this.db.$transaction(async (tx) => {
      const operations = lineItems.map(item => {
        const data = OrderMapper.mapLineItem(item);
        const id = data.id;
        delete data.id;

        return tx.haravan_line_items.upsert({
          where: { id },
          create: {
            uuid: crypto.randomUUID(),
            id,
            ...data,
            database_created_at: currentDateTime,
            database_updated_at: currentDateTime
          },
          update: {
            ...data,
            database_updated_at: currentDateTime
          }
        });
      });
      await Promise.all(operations);
    }, this.dbConnection);
  }

  async _upsertTransactions(transactions) {
    if (!transactions || transactions.length === 0) return;

    const currentDateTime = dayjs().utc().toDate();
    await this.db.$transaction(async (tx) => {
      const operations = transactions.map(item => {
        const data = OrderMapper.mapTransaction(item);
        const id = data.id;
        delete data.id;

        return tx.transactions.upsert({
          where: { id },
          create: {
            uuid: crypto.randomUUID(),
            id,
            ...data,
            database_created_at: currentDateTime,
            database_updated_at: currentDateTime
          },
          update: {
            ...data,
            database_updated_at: currentDateTime
          }
        });
      });
      await Promise.all(operations);
    }, this.dbConnection);
  }

  async _upsertFulfillments(fulfillments) {
    if (!fulfillments || fulfillments.length === 0) return;

    const currentDateTime = dayjs().utc().toDate();
    await this.db.$transaction(async (tx) => {
      const operations = fulfillments.map(item => {
        const data = OrderMapper.mapFulfillment(item);
        const id = data.id;
        delete data.id;

        return tx.fulfillments.upsert({
          where: { id },
          create: {
            uuid: crypto.randomUUID(),
            id,
            ...data,
            database_created_at: currentDateTime,
            database_updated_at: currentDateTime
          },
          update: {
            ...data,
            database_updated_at: currentDateTime
          }
        });
      });
      await Promise.all(operations);
    }, this.dbConnection);
  }

  async _upsertRefunds(refunds) {
    if (!refunds || refunds.length === 0) return;

    const currentDateTime = dayjs().utc().toDate();
    await this.db.$transaction(async (tx) => {
      const operations = refunds.map(item => {
        const data = OrderMapper.mapRefund(item);
        const id = data.id;
        delete data.id;

        return tx.refunds.upsert({
          where: { id },
          create: {
            uuid: crypto.randomUUID(),
            id,
            ...data,
            database_created_at: currentDateTime,
            database_updated_at: currentDateTime
          },
          update: {
            ...data,
            database_updated_at: currentDateTime
          }
        });
      });
      await Promise.all(operations);
    }, this.dbConnection);
  }
}
