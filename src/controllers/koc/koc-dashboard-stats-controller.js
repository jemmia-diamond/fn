import KocAffiliateService from "services/koc/koc-affiliate-service";

export default class KocDashboardStatsController {
  static async show(c) {
    const koc = c.get("koc");
    const session_id = c.req.query("sessionId") || "";
    const stats = await new KocAffiliateService(c.env).getDashboardStats(
      koc.kocId,
      session_id
    );

    return c.json(stats);
  }
}
