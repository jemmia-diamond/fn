import Database from "services/database";
import PancakeClient from "pancake/pancake-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import * as Sentry from "@sentry/cloudflare";
import { isInvalidTokenError, sleep } from "pancake/utils";

dayjs.extend(utc);

export default class TagSyncService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.pancakeClient = new PancakeClient(env.PANCAKE_ACCESS_TOKEN);
  }

  async syncTags() {
    try {
      console.warn("Starting syncTags...");

      const pageData = await this.pancakeClient.getPages();
      if (isInvalidTokenError(pageData)) {
        throw new Error("Pancake API Error [102]: Invalid access_token during page query");
      }

      const pages = pageData?.categorized?.activated || [];
      if (pages.length === 0) {
        console.warn("No activated pages found.");
        return;
      }

      for (const page of pages) {
        await this.syncPageTags(page.id);
        await sleep(1000);
      }

      console.warn("Finished syncTags.");
    } catch (error) {
      this.captureException(error);
    }
  }

  async syncPageTags(pageId) {
    if (!pageId) return;

    try {
      const data = await this.pancakeClient.getPageTags(pageId);

      if (isInvalidTokenError(data)) {
        this.captureException(new Error(`Pancake API Error [102]: Invalid access_token for tags in page ${pageId}`), pageId);
        return;
      }

      const tags = data?.tags || [];
      if (tags.length > 0) {
        await this.upsertTags(tags, pageId);
      }
    } catch (error) {
      this.captureException(error, pageId);
    }
  }

  async upsertTags(tags, pageId) {
    const tagUpserts = [];
    const duplicatesKey = new Set();

    for (const item of tags) {
      const tagId = item.id ? Number(item.id) : null;
      if (!tagId || duplicatesKey.has(tagId)) continue;
      duplicatesKey.add(tagId);

      const tagData = this.mapToTagModel(item, pageId, tagId);

      tagUpserts.push(this.db.tag_page.upsert({
        where: { page_id_id: { page_id: String(pageId), id: tagId } },
        create: { ...tagData, database_created_at: dayjs().utc().toDate() },
        update: { ...tagData, database_updated_at: dayjs().utc().toDate() }
      }));

      if (tagUpserts.length >= 50) {
        await Promise.all(tagUpserts);
        tagUpserts.length = 0;
      }
    }

    if (tagUpserts.length > 0) {
      await Promise.all(tagUpserts);
    }
  }

  mapToTagModel(item, pageId, tagId) {
    return {
      id: tagId,
      page_id: String(pageId),
      tag_label: item.text,
      description: item.description,
      database_updated_at: dayjs().utc().toDate()
    };
  }

  captureException(error, pageId = null) {
    const tags = { flow: "PancakeSync:tags" };
    if (pageId) tags.page_id = pageId;
    Sentry.captureException(error, { tags });
  }
}
