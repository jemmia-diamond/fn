import Salesaya from "services/salesaya";
import { CHAT_GROUPS } from "services/larksuite/group-chat/group-management/constant";
import LarksuiteService from "services/larksuite/lark";

export default class LarkChatSyncController {
  static async update(ctx) {
    const larkAxiosClient = await LarksuiteService.createAxiosClient(ctx.env);
    const larkClientV2 = await LarksuiteService.createClientV2(ctx.env);
    const service = new Salesaya.LarkChatSyncService(ctx.env, larkAxiosClient, larkClientV2);
    await service.syncChat(CHAT_GROUPS.MEDIA_GROUP.chat_id);
    return ctx.json({ message: "success" }, 200);
  }
}
