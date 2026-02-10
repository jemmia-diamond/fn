import { Context } from "hono";
import JemmiaShieldMessageService from "services/jemmia-shield/shield-message-view-service";

export default class JemmiaShieldMessageController {
  static async show(c: Context) {
    const data = c.req.query("data");
    const type = c.req.query("type") || "text";
    const code = c.req.query("code");

    if (!data) {
      return c.text("Missing data", 400);
    }

    const env = c.env;
    const contentHtml =
      await JemmiaShieldMessageService.processAndRenderMessage(
        env,
        data,
        code,
        type
      );

    return c.html(contentHtml);
  }
}
