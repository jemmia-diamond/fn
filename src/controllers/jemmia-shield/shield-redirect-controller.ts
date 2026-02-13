import JemmiaShieldLarkService from "services/jemmia-shield/jemmia-shield-lark-service";

export default class ShieldRedirectController {
  static async show(c: any) {
    const authUrl = await JemmiaShieldLarkService.getAuthUrl(c.env);
    return c.redirect(authUrl);
  }
}
