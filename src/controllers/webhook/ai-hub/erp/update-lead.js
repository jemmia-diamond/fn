import { HTTPException } from "hono/http-exception";
import LeadService from "services/erp/crm/lead/lead";

export default class AIHubERPUpdateLeadController {
  static async create(ctx) {
    let body = await ctx.req.json();
    const conversationId = body["conversationId"];
    if (!conversationId) {
      throw new HTTPException(400, "Conversation id is required");
    }

    let leadService = new LeadService(ctx.env);
    const res = await leadService.updateLeadInfoFromSummary(body.data, conversationId);

    return ctx.json(res);
  }
}

