import { HTTPException } from "hono/http-exception";
import LeadService from "../../../services/erp/lead";

export default class LeadController {
  static async update(ctx) {
    let body = await ctx.req.json();
    let conversationId = body["conversationId"];
    if (!conversationId) {
      throw new HTTPException("Conversation id is required");
    }

    let leadService = new LeadService(ctx.env);
    await leadService.updateLeadInfoFromSummary(body.data, conversationId);
  }
}
