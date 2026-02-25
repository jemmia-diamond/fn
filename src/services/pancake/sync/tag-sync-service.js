import Database from "services/database";
import PancakeClient from "pancake/pancake-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import * as Sentry from "@sentry/cloudflare";
import { isInvalidTokenError } from "pancake/utils";

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

      const pageList = pageData?.categorized?.activated || [];
      if (pageList.length === 0) {
        console.warn("No activated pages found.");
        return;
      }

      for (const page of pageList) {
        const pageId = page.id;
        if (!pageId) continue;

        try {
          const data = await this.pancakeClient.getPageTags(pageId);

          if (isInvalidTokenError(data)) {
            Sentry.captureException(new Error(`Pancake API Error [102]: Invalid access_token for tags in page ${pageId}`), {
              tags: { flow: "PancakeSync:tags", page_id: pageId }
            });
            continue;
          }

          if (data && data.tags && data.tags.length > 0) {
            await this.upsertTags(data.tags, pageId);
          }
        } catch (error) {
          Sentry.captureException(error, {
            tags: { flow: "PancakeSync:tags", page_id: pageId }
          });
        }
      }

      console.warn("Finished syncTags.");
    } catch (error) {
      Sentry.captureException(error, {
        tags: { flow: "PancakeSync:tags" }
      });
    }
  }

  async upsertTags(tags, pageId) {
    const tagUpserts = [];
    const duplicatesKey = new Set();

    for (const item of tags) {
      const tagId = item.id ? Number(item.id) : null;
      if (!tagId || duplicatesKey.has(tagId)) continue;
      duplicatesKey.add(tagId);

      tagUpserts.push(
        this.db.tag_page.upsert({
          where: {
            page_id_id: {
              page_id: String(pageId),
              id: tagId
            }
          },
          create: {
            id: tagId,
            page_id: String(pageId),
            tag_label: item.text,
            description: item.color,
            database_created_at: dayjs().utc().toDate(),
            database_updated_at: dayjs().utc().toDate()
          },
          update: {
            tag_label: item.text,
            description: item.color,
            database_updated_at: dayjs().utc().toDate()
          }
        })
      );

      if (tagUpserts.length >= 50) {
        await Promise.all(tagUpserts);
        tagUpserts.length = 0;
      }
    }

    if (tagUpserts.length > 0) {
      await Promise.all(tagUpserts);
    }
  }
}
