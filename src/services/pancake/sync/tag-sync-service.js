import Database from "services/database";
import PancakeClient from "pancake/pancake-client";
import * as Sentry from "@sentry/cloudflare";

export default class TagSyncService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.pancakeClient = new PancakeClient(env.PANCAKE_ACCESS_TOKEN);
  }

  async syncTags() {
    console.warn("Starting syncTags...");

    let pageData;
    try {
      pageData = await this.pancakeClient.getPages();
    } catch (e) {
      console.warn("Failed to fetch pancake pages", e);
      return;
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
        if (data && data.tags && data.tags.length > 0) {
          await this.upsertTags(data.tags, pageId);
        }
      } catch (error) {
        console.warn(`Error syncing tags for page ${pageId}: ${error.message}`);
        Sentry.captureException(error);
      }
    }

    console.warn("Finished syncTags.");
  }

  async upsertTags(tags, pageId) {
    const tagUpserts = [];
    const duplicatesKey = new Set();

    for (const item of tags) {
      const itemId = item.id;
      if (itemId == null) continue;

      const key = `${pageId}-${itemId}`;
      if (!duplicatesKey.has(key)) {
        duplicatesKey.add(key);

        const tagData = {
          page_id: pageId,
          id: itemId,
          tag_label: item.text || null,
          description: item.description || null
        };

        tagUpserts.push(
          this.db.tag_page.upsert({
            where: {
              page_id_id: {
                page_id: pageId,
                id: itemId
              }
            },
            create: {
              ...tagData,
              database_created_at: new Date(),
              database_updated_at: new Date()
            },
            update: {
              ...tagData,
              database_updated_at: new Date()
            }
          })
        );
      }
    }

    const chunkSize = 50;
    for (let i = 0; i < tagUpserts.length; i += chunkSize) {
      const chunk = tagUpserts.slice(i, i + chunkSize);
      await Promise.all(chunk);
    }
  }
}
