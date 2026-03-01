import Database from "services/database";
import PancakeClient from "pancake/pancake-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import * as Sentry from "@sentry/cloudflare";
import { isInvalidTokenError, sleep } from "pancake/utils";

dayjs.extend(utc);

const SYNC_PAGE_SIZE = 100;

export default class CustomerSyncService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.pancakeClient = new PancakeClient(env.PANCAKE_ACCESS_TOKEN);
    this.phoneRegex = /(?:\+84|0)(?:3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|89]|9[0-4|6-9])(?:\d{7})/;
  }

  async syncCustomers() {
    try {
      console.warn("Starting syncCustomers...");
      const { sinceUnix, untilUnix } = await this.getSyncTimeframe();

      const pageData = await this.pancakeClient.getPages();
      if (isInvalidTokenError(pageData)) {
        throw new Error("Pancake API Error [102]: Invalid access_token during page query");
      }

      const pages = pageData?.categorized?.activated || [];
      if (pages.length === 0) {
        console.warn("No activated pages found.");
        return;
      }

      for (let i = pages.length - 1; i >= 0; i--) {
        await this.syncPageCustomers(pages[i].id, sinceUnix, untilUnix);
        await sleep(1000);
      }

      await this.env.FN_KV.put(KV_KEY, now.format("YYYY-MM-DD HH:mm:ss"));
      console.warn(`Finished syncCustomers. Saved checkpoint: ${now.format("YYYY-MM-DD HH:mm:ss")}`);
    } catch (error) {
      this.captureException(error);
    }
  }

  async syncPageCustomers(pageId, sinceUnix, untilUnix) {
    if (!pageId) return;

    let pageNumber = 1;
    while (true) {
      try {
        const data = await this.pancakeClient.getPageCustomers(pageId, sinceUnix, untilUnix, pageNumber, SYNC_PAGE_SIZE);

        if (isInvalidTokenError(data)) {
          this.captureException(new Error(`Pancake API Error [102]: Invalid access_token for page ${pageId}`), pageId);
          break;
        }

        const customers = data?.customers || [];
        if (customers.length === 0) break;

        await this.upsertCustomers(customers, pageId);

        if (customers.length < SYNC_PAGE_SIZE) break;
        pageNumber++;
        await sleep(1000);
      } catch (error) {
        this.captureException(error, pageId);
        break;
      }
    }
  }

  async upsertCustomers(customers, pageId) {
    const customerUpserts = [];
    for (const item of customers) {
      if (!item.id) continue;
      const customerData = this.mapToCustomerModel(item, pageId);

      customerUpserts.push(this.db.page_customer.upsert({
        where: { id: item.id },
        create: customerData,
        update: { ...customerData, uuid: undefined, database_updated_at: dayjs().utc().toDate() }
      }));
    }

    const chunkSize = 50;
    for (let i = 0; i < customerUpserts.length; i += chunkSize) {
      const chunk = customerUpserts.slice(i, i + chunkSize);
      await Promise.all(chunk);
    }
  }

  mapToCustomerModel(item, pageId) {
    let phoneNumbers = item.phone_numbers || [];
    let phone = null;

    if (!phoneNumbers || phoneNumbers.length === 0) {
      const name = item.name;
      if (name) {
        const match = name.match(this.phoneRegex);
        if (match) {
          phone = match[0];
          phoneNumbers = [phone];
        }
      }
    } else {
      phone = phoneNumbers[phoneNumbers.length - 1];
    }

    return {
      uuid: crypto.randomUUID(),
      id: item.id,
      birthday: item.birthday || null,
      phone_numbers: phoneNumbers,
      phone: phone,
      notes: item.notes || [],
      can_inbox: item.can_inbox ?? null,
      customer_id: item.customer_id || null,
      gender: item.gender || null,
      inserted_at: item.inserted_at ? dayjs.utc(item.inserted_at).toDate() : null,
      lives_in: item.lives_in || null,
      name: item.name || null,
      updated_at: item.updated_at ? dayjs.utc(item.updated_at).toDate() : null,
      page_id: pageId
    };
  }

  async getSyncTimeframe() {
    const kv = this.env.FN_KV;
    const KV_KEY = "pancake_customer_sync_last_time";
    const now = dayjs().utc();
    const untilUnix = now.unix();

    const lastSyncTimeStr = await kv.get(KV_KEY);
    let sinceUnix;

    if (lastSyncTimeStr) {
      sinceUnix = dayjs.utc(lastSyncTimeStr).unix();
    } else {
      sinceUnix = now.subtract(10, "minutes").unix();
    }

    return { now, untilUnix, sinceUnix, KV_KEY };
  }

  captureException(error, pageId = null) {
    const tags = { flow: "PancakeSync:customers" };
    if (pageId) tags.page_id = pageId;
    Sentry.captureException(error, { tags });
  }
}
