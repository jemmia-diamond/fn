import Database from "services/database";
import PancakeClient from "pancake/pancake-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import * as Sentry from "@sentry/cloudflare";
import { isInvalidTokenError } from "pancake/utils";

dayjs.extend(utc);

export default class CustomerSyncService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.pancakeClient = new PancakeClient(env.PANCAKE_ACCESS_TOKEN);
    this.phoneRegex = /(?:\+84|0)(?:3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|89]|9[0-4|6-9])(?:\d{7})/;
  }

  async syncCustomers() {
    console.warn("Starting syncCustomers...");

    const now = dayjs().utc();
    const untilUnix = now.unix();

    const anyCustomer = await this.db.page_customer.findFirst({ select: { id: true } });
    let sinceUnix;
    if (!anyCustomer) {
      sinceUnix = now.subtract(1, "year").unix();
    } else {
      sinceUnix = now.subtract(10, "minutes").unix();
    }

    let pageData;
    try {
      pageData = await this.pancakeClient.getPages();
      if (isInvalidTokenError(pageData)) {
        Sentry.captureException(new Error("Pancake API Error [102]: Invalid access_token during page query"));
        return;
      }
    } catch (e) {
      console.warn("Failed to fetch pancake pages", e);
      return;
    }

    const pageList = pageData?.categorized?.activated || [];
    if (pageList.length === 0) {
      console.warn("No activated pages found.");
      return;
    }

    for (let i = pageList.length - 1; i >= 0; i--) {
      const page = pageList[i];
      const pageId = page.id;
      let pageNumber = 1;
      const pageSize = 100;

      while (true) {
        try {
          const data = await this.pancakeClient.getPageCustomers(
            pageId,
            sinceUnix,
            untilUnix,
            pageNumber,
            pageSize
          );

          if (isInvalidTokenError(data)) {
            Sentry.captureException(new Error(`Pancake API Error [102]: Invalid access_token for page ${pageId}`));
            break;
          }

          if (!data || !data.customers || data.customers.length === 0) {
            break;
          }

          const customers = data.customers;
          await this.upsertCustomers(customers, pageId);

          if (customers.length < pageSize) {
            break;
          }

          pageNumber++;
        } catch (error) {
          console.warn(`Error syncing customer for page ${pageId}: ${error.message}`);
          Sentry.captureException(error);
          pageNumber++;
        }
      }
    }

    console.warn("Finished syncCustomers.");
  }

  async upsertCustomers(customers, pageId) {
    const customerUpserts = [];

    for (const item of customers) {
      if (!item.id) continue;

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

      const customerData = {
        uuid: crypto.randomUUID(),
        id: item.id,
        birthday: item.birthday || null,
        phone_numbers: phoneNumbers,
        phone: phone,
        notes: item.notes || [],
        can_inbox: item.can_inbox ?? null,
        customer_id: item.customer_id || null,
        gender: item.gender || null,
        inserted_at: item.inserted_at ? new Date(item.inserted_at) : null,
        lives_in: item.lives_in || null,
        name: item.name || null,
        updated_at: item.updated_at ? new Date(item.updated_at) : null,
        page_id: pageId
      };

      customerUpserts.push(
        this.db.page_customer.upsert({
          where: { id: item.id },
          create: customerData,
          update: {
            ...customerData,
            uuid: undefined,
            database_updated_at: new Date()
          }
        })
      );
    }

    const chunkSize = 50;
    for (let i = 0; i < customerUpserts.length; i += chunkSize) {
      const chunk = customerUpserts.slice(i, i + chunkSize);
      await Promise.all(chunk);
    }
  }
}
