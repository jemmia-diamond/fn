import LarkChatSyncMediaService from "services/salesaya/lark-chat/lark-chat-sync-media-service";

export default class LarkChatSyncMediaController {
  static async create(c) {
    const body = await c.req.json();
    const startTime = body.startTime;
    await LarkChatSyncMediaService.syncMedia(c.env, startTime);
    return c.json({
      success: true,
      message: "Sync media job triggered"
    });
  }
}
