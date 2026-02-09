import JemmiaShieldLarkService from "services/jemmia-shield/jemmia-shield-lark-service";
import * as Sentry from "@sentry/cloudflare";

export default class JemmiaShieldBotController {
  static async create(c: any) {
    try {
      const { chatId, accessToken } = await c.req.json();

      if (!chatId || !accessToken) {
        return c.json({ success: false, message: "Missing params" }, 400);
      }

      try {
        await JemmiaShieldLarkService.addBotToGroup(c.env, chatId, accessToken);
      } catch (e: any) {
        Sentry.captureException(e);
      }

      await JemmiaShieldLarkService.addBotAsManager(c.env, chatId, accessToken);

      return c.json({ success: true });
    } catch (e: any) {
      Sentry.captureException(e);
      return c.json({ success: false, message: e.message }, 500);
    }
  }
}
