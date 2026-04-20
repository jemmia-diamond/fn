/* eslint-disable no-console */
import DocxService from "services/larksuite/docs/docx";
import WikiService from "services/larksuite/wiki/wiki";
import LarksuiteService from "services/larksuite/lark";
import * as Sentry from "@sentry/cloudflare";
import dayjs from "dayjs";
import { sleep } from "services/utils/sleep";

export default class DocxRawContentSyncService {
  static KV_KEY = "larksuite:docx_sync:last_sync_time";
  static DIRECT_NODES = [
    {
      name: "Tech Team Knowledge",
      nodeToken: "LKZlwo4tkidMOskk8GDlUBCXg1f",
      skipSelf: true
    }
  ];

  constructor(env) {
    this.env = env;
  }

  async sync() {
    const kv = this.env.FN_KV;

    // Feature Flag Check
    const isEnabled = await kv.get("fv_fn_DOCX_RAW_CONTENT_SYNC_ENABLED");
    if (isEnabled === "false") {
      console.warn("[DocxRawContentSyncService] Flow is disabled via feature flag (fv_fn_DOCX_RAW_CONTENT_SYNC_ENABLED). Skipping sync.");
      return;
    }

    const toDate = dayjs().utc().toISOString();

    // Set to 0 for normal incremental sync, or a number (e.g., 5) to backfill the last X hours.
    const FORCE_BACKFILL_HOURS = 24;

    let lastSyncTimestamp;
    if (FORCE_BACKFILL_HOURS > 0) {
      lastSyncTimestamp = dayjs
        .utc()
        .subtract(FORCE_BACKFILL_HOURS, "hours")
        .valueOf();
      console.warn(
        `[DocxRawContentSyncService] !!! FORCING BACKFILL: Fetching all changes since ${dayjs(lastSyncTimestamp).toISOString()} !!!`
      );
    } else {
      const lastSyncDate = await kv.get(DocxRawContentSyncService.KV_KEY);
      lastSyncTimestamp = lastSyncDate
        ? dayjs(lastSyncDate).subtract(5, "minutes").valueOf()
        : 0;
    }

    try {
      if (FORCE_BACKFILL_HOURS === 0) {
        console.warn(
          `[DocxRawContentSyncService] Starting recursive sync... (Last successful sync: ${dayjs(lastSyncTimestamp).toISOString()})`
        );
      }

      const larkClient = await LarksuiteService.createClientV2(
        this.env,
        "brainy"
      );

      const documentsToSync = [];
      const processedTokens = new Set();
      const discoveryQueue = [];

      // 1. Seed Discovery Queue from Direct Nodes
      for (const direct of DocxRawContentSyncService.DIRECT_NODES) {
        console.warn(
          `[DocxRawContentSyncService] Seeding direct node: ${direct.name} (${direct.nodeToken})`
        );
        try {
          const node = await WikiService.getNode({
            larkClient,
            nodeToken: direct.nodeToken
          });

          if (node) {
            const nodeUpdateTime =
              parseInt(
                node.node_update_time ||
                  node.obj_edit_time ||
                  node.update_time ||
                  0,
                10
              ) * 1000;
            const updated = nodeUpdateTime > lastSyncTimestamp;

            // Add the parent node itself if it's a docx and updated (unless skipped)
            if (node.obj_type === "docx") {
              if (updated && !direct.skipSelf) {
                documentsToSync.push({
                  documentId: node.obj_token,
                  title: node.title
                });
              } else if (!updated) {
                console.warn(
                  `[DocxRawContentSyncService] Skipping direct node content: ${node.title} (Modified: ${dayjs(nodeUpdateTime).toISOString()}, Threshold: ${dayjs(lastSyncTimestamp).toISOString()})`
                );
              } else {
                console.warn(
                  `[DocxRawContentSyncService] Ignoring parent document content: ${node.title} (Reason: skipSelf)`
                );
              }
              processedTokens.add(node.node_token);
            }

            // Always check for children of direct nodes to ensure deep discovery
            discoveryQueue.push({
              spaceId: node.space_id,
              parentToken: node.node_token
            });
          }
        } catch (err) {
          console.error(
            `[DocxRawContentSyncService] Failed to seed direct node ${direct.nodeToken}:`,
            err.message
          );
        }
      }

      // 2. Recursive Discovery
      while (discoveryQueue.length > 0) {
        const { spaceId, parentToken } = discoveryQueue.shift();

        try {
          const nodes = await WikiService.listNodes({
            larkClient,
            spaceId,
            parentNodeToken: parentToken
          });

          for (const node of nodes) {
            if (processedTokens.has(node.node_token)) continue;
            processedTokens.add(node.node_token);

            const nodeUpdateTime =
              parseInt(
                node.node_update_time ||
                  node.obj_edit_time ||
                  node.update_time ||
                  0,
                10
              ) * 1000;
            const updated = nodeUpdateTime > lastSyncTimestamp;

            if (node.obj_type === "docx") {
              if (updated) {
                documentsToSync.push({
                  documentId: node.obj_token,
                  title: node.title
                });
              } else {
                console.warn(
                  `[DocxRawContentSyncService] Skipping nested document: ${node.title} (Modified: ${dayjs(nodeUpdateTime).toISOString()}, Threshold: ${dayjs(lastSyncTimestamp).toISOString()})`
                );
              }
            }

            // If node has sub-pages, add to discovery queue
            if (node.has_child) {
              discoveryQueue.push({
                spaceId: node.space_id,
                parentToken: node.node_token
              });
            }
          }
        } catch (discoveryError) {
          console.error(
            `[DocxRawContentSyncService] Discovery failed for ${parentToken || spaceId}:`,
            discoveryError.message
          );
        }
      }

      console.warn(
        `[DocxRawContentSyncService] Discovered ${documentsToSync.length} documents to sync.`
      );

      for (const doc of documentsToSync) {
        console.warn(
          `[DocxRawContentSyncService] Fetching raw content for document: ${doc.title} (${doc.documentId})`
        );

        try {
          const rawData = await DocxService.getRawContent({
            larkClient,
            documentId: doc.documentId
          });

          console.warn(
            `[DocxRawContentSyncService] Full Response Body for "${doc.title}":`,
            JSON.stringify(rawData, null, 2)
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
