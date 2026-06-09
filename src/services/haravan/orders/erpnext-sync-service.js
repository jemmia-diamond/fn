import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import HaravanAPI from "services/clients/haravan-client";
import { sleep } from "services/utils/sleep";
import { isTestOrder } from "services/utils/order-intercepter";

dayjs.extend(utc);

export default class ERPNextOrderCreationSyncService {
  static RATE_LIMIT_DELAY_MS = 500;
  static MAX_RETRY_AFTER_SECONDS = 3;

  constructor(env) {
    this.env = env;
  }

  async sync() {
    const toDate = dayjs().utc().toISOString();
    const fromDate = dayjs().utc().subtract(10, "minutes").toISOString();
    const HRV_API_KEY = this.env.HARAVAN_TOKEN;
    const haravanClient = new HaravanAPI(HRV_API_KEY);

    await this._fetchAndProcessOrders(haravanClient, fromDate, toDate);
  }

  async _fetchAndProcessOrders(haravanClient, fromDate, toDate) {
    let page = 1;
    let hasMore = true;
    let skipNextSleep = false;
    const limit = 50;

    while (hasMore) {
      if (page > 1 && !skipNextSleep) {
        await sleep(ERPNextOrderCreationSyncService.RATE_LIMIT_DELAY_MS);
      }
      skipNextSleep = false;

      try {
        const response = await haravanClient.order.getOrders({
          updated_at_min: fromDate,
          page,
          limit
        });
        const orders = response?.orders || [];

        if (orders.length > 0) {
          await this._processOrderBatch(orders, fromDate, toDate);
          page++;
        } else {
          hasMore = false;
        }
      } catch (error) {
        if (error.status === 429) {
          const retryAfter = parseFloat(error.retryAfter || 2);
          if (retryAfter > ERPNextOrderCreationSyncService.MAX_RETRY_AFTER_SECONDS) {
            throw new Error(
              `Rate limited for ${retryAfter}s (exceeds ${ERPNextOrderCreationSyncService.MAX_RETRY_AFTER_SECONDS}s threshold)`
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

  async _processOrderBatch(orders, fromDate, toDate) {
    if (!orders?.length) return;

    const validOrders = orders.filter(order => {
      if (isTestOrder(order)) return false;

      const orderUpdatedAt = dayjs(order.updated_at);
      if (orderUpdatedAt.isBefore(fromDate) || orderUpdatedAt.isAfter(toDate)) return false;
      return true;
    });

    if (validOrders.length === 0) return;

    for (const order of validOrders) {
      await this.env["ERPNEXT_ORDER_CREATION_QUEUE"].send(order);
    }
  }
}
