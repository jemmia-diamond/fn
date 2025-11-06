import ERP from "services/erp";

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
      return ctx.json({ success: false, data: "Lead not found" }, 404);
    }
    return ctx.json({ success: true });
  }

  static async update(ctx) {
    const leadService = new ERP.CRM.LeadService(ctx.env);
    const data = await ctx.req.json();
    const { id } = ctx.req.param();
    if(!id) {
      return ctx.json({ success: false, data: "Lead id is required" }, 400);
    }
    const response = await leadService.updateLeadFromSalesaya(id, data);
    if (!response.success) {
      return ctx.json({ success: false, data: response.exception }, 400);
    }
    return ctx.json({ success: true, data: response.data });
  }
}
