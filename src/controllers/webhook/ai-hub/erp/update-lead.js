import { HTTPException } from "hono/http-exception";
import LeadService from "../../../../services/erp/lead";

export default class AIHubERPUpdateLeadController {
  static async create(ctx) {
    let body = await ctx.req.json();
    let conversationId = body["conversationId"];
    if (!conversationId) {
      throw new HTTPException(400, "Conversation id is required");
    }

    let leadService = new LeadService(ctx.env);
    await leadService.updateLeadInfoFromSummary(body.data, conversationId);
    return ctx.json({ success: true });
  }
}

