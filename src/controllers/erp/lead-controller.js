import ERP from "services/erp";
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

  static async update(ctx) {
    const leadService = new ERP.CRM.LeadService(ctx.env);
    const data = await ctx.req.json();
    const { id } = ctx.req.param();
    if(!id) {
      throw new HTTPException(400, "Lead id is required");
    }
    const response = await leadService.updateLeadFromSalesaya(id, data);
    if (!response.success) {
      throw new HTTPException(400, response.message);
    }
    return ctx.json({ success: true, data: response.data });
  }
}
