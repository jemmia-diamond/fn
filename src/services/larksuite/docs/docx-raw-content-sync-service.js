/* eslint-disable no-console */
import WikiService from "services/larksuite/wiki/wiki";
import DocxService from "services/larksuite/docs/docx";
import * as Sentry from "@sentry/cloudflare";
import dayjs from "dayjs";
import { sleep } from "services/utils/sleep";

export default class DocxRawContentSyncService {
  static KV_KEY = "larksuite:docx_sync:last_sync_time";

  constructor(env) {
    this.env = env;
  }

  async sync() {
    const kv = this.env.FN_KV;
    const lastSyncDate = await kv.get(DocxRawContentSyncService.KV_KEY);
    const toDate = dayjs().utc().toISOString();

    // Use a 5-minute buffer to ensure we don't miss updates due to eventual consistency
    const lastSyncTimestamp = lastSyncDate
      ? dayjs(lastSyncDate).subtract(5, "minutes").valueOf()
      : 0;

    try {
      console.warn(`[DocxRawContentSyncService] Starting sync... (Last sync: ${lastSyncDate || "Never"})`);

      const spaces = await WikiService.listSpaces(this.env);
      console.warn(`[DocxRawContentSyncService] Found ${spaces.length} spaces.`);

      for (const space of spaces) {
        const spaceId = space.space_id;
        const spaceName = space.name;
        console.warn(`[DocxRawContentSyncService] Processing space: ${spaceName} (${spaceId})`);

        const nodes = await WikiService.listNodes(this.env, spaceId);
        console.warn(`[DocxRawContentSyncService] Found ${nodes.length} nodes in space ${spaceId}.`);

        for (const node of nodes) {
          if (node.obj_type === "docx") {
            const documentId = node.obj_token;
            const title = node.title;
            const editTime = parseInt(node.obj_edit_time, 10) * 1000; // Lark returns seconds

            if (editTime <= lastSyncTimestamp) {
              console.warn(`[DocxRawContentSyncService] Skipping document: "${title}" (Not modified since ${dayjs(lastSyncTimestamp).toISOString()})`);
              continue;
            }

            console.warn(`[DocxRawContentSyncService] Fetching raw content for document: ${title} (${documentId})`);

            try {
              const rawData = await DocxService.getRawContent(this.env, documentId);

              console.warn(`[DocxRawContentSyncService] Successfully fetched raw content for "${title}" (Size: ${rawData.content?.length || 0} bytes).`);
            } catch (innerError) {
              console.error(`[DocxRawContentSyncService] Failed to fetch raw content for document ${documentId}: ${innerError.message}`);
              Sentry.captureException(innerError);
            }

            // Rate limiting protection
            await sleep(500);
          }
        }
      }

      console.warn("[DocxRawContentSyncService] Sync loop completed.");
    } catch (error) {
      console.error("[DocxRawContentSyncService] Sync failed:", error);
      Sentry.captureException(error);
    } finally {
      try {
        await kv.put(DocxRawContentSyncService.KV_KEY, toDate);
        console.warn(`[DocxRawContentSyncService] Updated checkpoint to ${toDate}.`);
      } catch (kvError) {
        console.error("[DocxRawContentSyncService] Failed to update checkpoint in KV:", kvError);
        Sentry.captureException(kvError);
      }
    }
  }
}

