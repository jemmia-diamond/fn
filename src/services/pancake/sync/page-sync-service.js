import Database from "services/database";
import PancakeClient from "pancake/pancake-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import * as Sentry from "@sentry/cloudflare";
import { isInvalidTokenError } from "pancake/utils";

dayjs.extend(utc);

export default class PageSyncService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.pancakeClient = new PancakeClient(env.PANCAKE_ACCESS_TOKEN);
  }

  async syncPages() {
    try {
      console.warn("Starting syncPages...");

      const pageData = await this.pancakeClient.getPages();
      if (isInvalidTokenError(pageData)) {
        throw new Error("Pancake API Error [102]: Invalid access_token during page query");
      }

      const categorized = pageData?.categorized;
      if (!categorized) {
        console.warn("No pages data returned.");
        return;
      }

      const pageList = [
        ...(categorized.activated || []),
        ...(categorized.inactivated || [])
      ];

      if (pageList.length === 0) {
        console.warn("Page list is empty.");
        return;
      }

      await this.upsertPages(pageList);

      for (const page of pageList) {
        await this.syncPageUsers(page.id);
      }

      console.warn("Finished syncPages.");
    } catch (error) {
      this.captureException(error);
    }
  }

  async syncPageUsers(pageId) {
    if (!pageId) return;

    try {
      const userListData = await this.pancakeClient.getPageUsers(pageId);

      if (isInvalidTokenError(userListData)) {
        this.captureException(new Error(`Pancake API Error [102]: Invalid access_token for users in page ${pageId}`), pageId);
        return;
      }

      const users = userListData?.users || [];
      if (users.length > 0) {
        await this.upsertUsers(users);
      }
    } catch (error) {
      this.captureException(error, pageId);
    }
  }

  async upsertPages(pages) {
    const pageUpserts = [];
    for (const item of pages) {
      if (!item.id) continue;
      const pageData = this.mapToPageModel(item);

      pageUpserts.push(this.db.page.upsert({
        where: { id: item.id },
        create: pageData,
        update: { ...pageData, uuid: undefined, database_updated_at: dayjs().utc().toDate() }
      }));
    }

    const chunkSize = 50;
    for (let i = 0; i < pageUpserts.length; i += chunkSize) {
      await Promise.all(pageUpserts.slice(i, i + chunkSize));
    }
  }

  async upsertUsers(users) {
    const userUpserts = [];
    const uniqueUsersMap = new Map();

    for (const user of users) {
      if (user.id) uniqueUsersMap.set(user.id, user);
    }

    for (const user of uniqueUsersMap.values()) {
      const userData = this.mapToUserModel(user);
      userUpserts.push(this.db.pancake_user.upsert({
        where: { id: user.id },
        create: { ...userData, database_created_at: dayjs().utc().toDate(), database_updated_at: dayjs().utc().toDate() },
        update: { ...userData, database_updated_at: dayjs().utc().toDate() }
      }));
    }

    const chunkSize = 50;
    for (let i = 0; i < userUpserts.length; i += chunkSize) {
      await Promise.all(userUpserts.slice(i, i + chunkSize));
    }
  }

  mapToPageModel(item) {
    return {
      uuid: crypto.randomUUID(),
      id: item.id,
      inserted_at: item.inserted_at ? dayjs.utc(item.inserted_at).toDate() : null,
      connected: item.connected ?? null,
      is_activated: item.is_activated ?? null,
      name: item.name || null,
      platform: item.platform || null,
      timezone: item.timezone != null ? String(item.timezone) : null,
      settings: item.settings || null,
      platform_extra_info: item.platform_extra_info || null
    };
  }

  mapToUserModel(user) {
    return {
      id: user.id,
      name: user.name || null,
      status: user.status || null,
      fb_id: user.fb_id || null,
      page_permissions: user.page_permissions || null,
      status_round_robin: user.status_round_robin || null,
      status_in_page: user.status_in_page || null,
      is_online: user.is_online ?? null
    };
  }

  captureException(error, pageId = null) {
    const tags = { flow: "PancakeSync:pages" };
    if (pageId) tags.page_id = pageId;
    Sentry.captureException(error, { tags });
  }
}
