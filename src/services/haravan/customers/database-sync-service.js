import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import Database from "services/database";
import HaravanAPI from "services/clients/haravan-client";
import CustomerMapper from "services/haravan/customers/customer-mapper";
import * as crypto from "crypto";
import { sleep } from "services/utils/sleep.js";

dayjs.extend(utc);

export default class CustomerDatabaseSyncService {
  static RATE_LIMIT_DELAY_MS = 500;
  static MAX_RETRY_AFTER_SECONDS = 3;
  static DEFAULT_KV_KEY = "haravan_customer_sync:last_date";

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
    const KV_KEY = CustomerDatabaseSyncService.DEFAULT_KV_KEY;
    const toDate = dayjs().utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
    const lastSyncDate = await kv.get(KV_KEY);

    const fromDate = lastSyncDate
      ? dayjs(lastSyncDate).subtract(5, "minutes").format("YYYY-MM-DDTHH:mm:ss[Z]")
      : dayjs().utc().subtract(1, "hour").format("YYYY-MM-DDTHH:mm:ss[Z]");

    try {
      const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();
      const haravanClient = new HaravanAPI(HRV_API_KEY);

      await this._fetchAndProcessCustomers(haravanClient, fromDate);
      await kv.put(KV_KEY, toDate);
    } catch {
      if (lastSyncDate && dayjs(toDate).diff(dayjs(lastSyncDate), "hour") >= 1) {
        await kv.put(KV_KEY, toDate);
      }
    }
  }

  async _fetchAndProcessCustomers(haravanClient, updatedAtMin) {
    let page = 1;
    let hasMore = true;
    let skipNextSleep = false;
    const limit = 50;

    while (hasMore) {
      if (page > 1 && !skipNextSleep) {
        await sleep(CustomerDatabaseSyncService.RATE_LIMIT_DELAY_MS);
      }
      skipNextSleep = false;

      try {
        const response = await haravanClient.customer.getCustomers(null, {
          updated_at_min: updatedAtMin,
          page,
          limit
        });
        const customers = response?.customers || [];

        if (customers.length > 0) {
          await this._upsertCustomers(customers);
          page++;
        } else {
          hasMore = false;
        }
      } catch (error) {
        if (error.status === 429) {
          const retryAfter = parseFloat(error.retryAfter || 2);
          if (retryAfter > CustomerDatabaseSyncService.MAX_RETRY_AFTER_SECONDS) {
            throw new Error(
              `Rate limited for ${retryAfter}s (exceeds ${CustomerDatabaseSyncService.MAX_RETRY_AFTER_SECONDS}s threshold)`
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

  async _upsertCustomers(customers) {
    if (!customers || customers.length === 0) return;

    const currentDateTime = dayjs().utc().toDate();
    await this.db.$transaction(async (tx) => {
      const operations = customers.map(customer => {
        const data = CustomerMapper.mapCustomer(customer);
        const id = data.id;
        delete data.id;

        return tx.haravan_customers.upsert({
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
