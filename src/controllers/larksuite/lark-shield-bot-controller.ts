import RecallLarkService from "services/larksuite/recall-lark-service";

export default class LarkShieldBotController {
  static async create(c: any) {
    try {
      const { chatId, accessToken } = await c.req.json();

      if (!chatId || !accessToken) {
        return c.json({ success: false, message: "Missing params" }, 400);
      }

      // Add bot to group first
      try {
        await RecallLarkService.addBotToGroup(c.env, chatId, accessToken);
      } catch (e: any) {
        console.warn(
          `Bot might already be in group or failed to add: ${e.message}`
        );
      }

      // Then add as manager
      await RecallLarkService.addBotAsManager(c.env, chatId, accessToken);

      return c.json({ success: true });
    } catch (e: any) {
      console.warn("BotController addBot Error:", e);
      return c.json({ success: false, message: e.message }, 500);
    }
  }
}
