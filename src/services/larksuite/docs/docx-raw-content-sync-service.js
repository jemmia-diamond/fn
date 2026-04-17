/* eslint-disable no-console */
import DocxService from "services/larksuite/docs/docx";
import LarksuiteService from "services/larksuite/lark";
import * as Sentry from "@sentry/cloudflare";
import dayjs from "dayjs";
import { sleep } from "services/utils/sleep";

export default class DocxRawContentSyncService {
  static KV_KEY = "larksuite:docx_sync:last_sync_time";
  static ALLOWED_SPACES = [
    7625925816733126366 // Jemmia - Van Ban Chinh Thuc
  ];

  constructor(env) {
    this.env = env;
  }

  async sync() {
    const kv = this.env.FN_KV;
    const lastSyncDate = await kv.get(DocxRawContentSyncService.KV_KEY);
    const toDate = dayjs().utc().toISOString();

    const lastSyncTimestamp = lastSyncDate
      ? dayjs(lastSyncDate).subtract(5, "minutes").valueOf()
      : 0;

    try {
      console.warn(
        `[DocxRawContentSyncService] Starting sync... (Last sync: ${lastSyncDate || "Never"})`
      );

      const larkClient = await LarksuiteService.createClientV2(this.env);
      const spaces = [];
      let pageToken = null;
      let hasMore = true;
      while (hasMore) {
        const res = await larkClient.wiki.space.list({
          params: {
            page_size: 50,
            page_token: pageToken
          }
        });
        spaces.push(...(res?.data?.items ?? []));
        hasMore = res?.data?.has_more ?? false;
        pageToken = res?.data?.page_token;
      }
      console.warn(
        `[DocxRawContentSyncService] Found ${spaces.length} spaces.`
      );

      const documentsToSync = [];

      for (const space of spaces) {
        const spaceId = space.space_id;
        const spaceName = space.name;
        const spaceUpdateTime = parseInt(space.update_time || 0, 10) * 1000;

        if (spaceUpdateTime <= lastSyncTimestamp) {
          console.warn(
            `[DocxRawContentSyncService] Skipping space: ${spaceName} (${spaceId}) - not updated since last sync`
          );
          continue;
        }

        if (!DocxRawContentSyncService.ALLOWED_SPACES.includes(spaceId)) {
          console.warn(
            `[DocxRawContentSyncService] Skipping space: ${spaceName} (${spaceId}) - not in allowed list`
          );
          continue;
        }

        console.warn(
          `[DocxRawContentSyncService] Processing space: ${spaceName} (${spaceId})`
        );

        const nodes = [];
        let nodePageToken = null;
        let nodeHasMore = true;
        while (nodeHasMore) {
          const res = await larkClient.wiki.spaceNode.list({
            path: {
              space_id: spaceId
            },
            params: {
              page_size: 50,
              page_token: nodePageToken
            }
          });
          nodes.push(...(res?.data?.items ?? []));
          nodeHasMore = res?.data?.has_more ?? false;
          nodePageToken = res?.data?.page_token;
        }
        console.warn(
          `[DocxRawContentSyncService] Found ${nodes.length} nodes in space ${spaceId}.`
        );

        for (const node of nodes) {
          if (node.obj_type === "docx") {
            const documentId = node.obj_token;
            const title = node.title;
            documentsToSync.push({ documentId, title });
          }
        }
      }

      console.warn(
        `[DocxRawContentSyncService] Found ${documentsToSync.length} documents to sync.`
      );

      for (const doc of documentsToSync) {
        console.warn(
          `[DocxRawContentSyncService] Fetching raw content for document: ${doc.title} (${doc.documentId})`
        );

        try {
          const rawData = await DocxService.getRawContent(
            this.env,
            doc.documentId
          );

          console.warn(
            `[DocxRawContentSyncService] Successfully fetched raw content for "${doc.title}" (Size: ${JSON.stringify(rawData.content).length} bytes).`
          );
        } catch (innerError) {
          console.error(
            `[DocxRawContentSyncService] Failed to fetch raw content for document ${doc.documentId}: ${innerError.message}`
          );
          Sentry.captureException(innerError);
        }

        await sleep(500);
      }
    } catch (error) {
      console.error("[DocxRawContentSyncService] Sync failed:", error);
      Sentry.captureException(error);
    } finally {
      try {
        await kv.put(DocxRawContentSyncService.KV_KEY, toDate);
        console.warn(
          `[DocxRawContentSyncService] Updated checkpoint to ${toDate}.`
        );
      } catch (kvError) {
        console.error(
          "[DocxRawContentSyncService] Failed to update checkpoint in KV:",
          kvError
        );
        Sentry.captureException(kvError);
      }
    }
  }
}
