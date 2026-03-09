import LarkChatSyncMediaService from "services/salesaya/lark-chat/lark-chat-sync-media-service";
import * as Sentry from "@sentry/cloudflare";

export default class LarkChatSyncMediaController {
  static async create(c) {
    try {
      const body = await c.req.json();
      const startTime = body.startTime;
      await LarkChatSyncMediaService.syncMedia(c.env, startTime);
      return c.json({
        success: true,
        message: "Sync media job triggered"
      });
    } catch (error) {
      Sentry.captureException(error);
      return c.json({
        success: false,
        message: "Sync media job failed",
        error: error.message
      });
    }

  }
}
