import KocAffiliateService from "services/koc/koc-affiliate-service";

export default class KocSessionsController {
  static async index(c) {
    const koc = c.get("koc");
    const items = await new KocAffiliateService(c.env).getSessions(koc.kocId);

    return c.json({ items });
  }
}
