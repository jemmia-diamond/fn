import ERP from "../../services/erp";
import { HTTPException } from "hono/http-exception";

export default class LeadController {
  static async index(ctx) {
    const leadService = new ERP.CRM.LeadService(ctx.env);
    const queryParams = await ctx.req.query();
    const conversationId = queryParams.conversation_id;
    if (conversationId) {
      try {
        const lead = await leadService.findLeadByConversationId(conversationId);
        if (lead) {
          return ctx.json(lead);
        }
        throw new HTTPException(404, "Lead not found");
      } catch (error) {
        if (error instanceof HTTPException) throw error;
        throw new HTTPException(500, "Failed to retrieve lead");
      }
    }
    return ctx.json({ success: true });
  }

  static async update(ctx) {
    const leadService = new ERP.CRM.LeadService(ctx.env);
    const data = await ctx.req.json();
    const { id } = ctx.req.param();
    if(!id) {
      throw new HTTPException(400, "Lead id is required");
    }
    const lead = await leadService.updateLeadFromSalesaya(id, data);
    if (!lead) {
      throw new HTTPException(404, "Lead not found");
    }
    return ctx.json({ success: true, lead });
  }
}
