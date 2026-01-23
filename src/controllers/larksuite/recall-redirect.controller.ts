import RecallLarkService from "services/larksuite/recall-lark.service";

export default class RecallRedirectController {
  static async index(c: any) {
    const authUrl = await RecallLarkService.getAuthUrl(c.env);
    console.warn("Generated Lark Auth URL:", authUrl);
    return c.redirect(authUrl);
  }
}
