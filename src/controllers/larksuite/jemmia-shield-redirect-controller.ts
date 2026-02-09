import JemmiaShieldLarkService from "services/jemmia-shield/jemmia-shield-lark-service";

export default class JemmiaShieldRedirectController {
  static async index(c: any) {
    const authUrl = await JemmiaShieldLarkService.getAuthUrl(c.env);
    console.warn("Generated Lark Auth URL:", authUrl);
    return c.redirect(authUrl);
  }
}
