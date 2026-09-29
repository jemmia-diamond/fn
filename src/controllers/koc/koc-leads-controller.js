import KocAffiliateService from "services/koc/koc-affiliate-service";

export default class KocLeadsController {
  static async index(c) {
    const koc = c.get("koc");
    const session_id = c.req.query("sessionId") || "";
    const page = parseInt(c.req.query("page") || "1", 10);
    const page_size = parseInt(c.req.query("pageSize") || "10", 10);

    const service = new KocAffiliateService(c.env);
    const leads = await service.getLeads(koc.kocId, {
      session_id,
      page,
      page_size
    });

    return c.json(leads);
  }
}
