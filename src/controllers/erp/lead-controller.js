import ERP from "../../services/erp";
import { HTTPException } from "hono/http-exception";

export default class LeadController {
  static async index(ctx) {
    const leadService = new ERP.CRM.LeadService(ctx.env);
    const queryParams = await ctx.req.query();
    const conversationId = queryParams.conversation_id;
    if (conversationId) {
      const lead = await leadService.findLeadByConversationId(conversationId);
      if (lead) {
        return ctx.json(lead);
      }
      throw new HTTPException(404, "Lead not found");
    }
    return ctx.json({ success: true });
  }
}
