import JemmiaShieldLarkService from "services/jemmia-shield/jemmia-shield-lark-service";

export default class JemmiaShieldGroupBotGrantController {
  static async create(c: any) {
    const { chatId, accessToken } = await c.req.json();

    if (!chatId || !accessToken) {
      return c.json({ success: false, message: "Missing params" }, 400);
    }

    await JemmiaShieldLarkService.addBotToGroup(c.env, chatId, accessToken);
    await JemmiaShieldLarkService.addBotAsManager(c.env, chatId, accessToken);

    return c.json({ success: true });
  }
}
