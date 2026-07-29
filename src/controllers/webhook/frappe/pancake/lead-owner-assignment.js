import Pancake from "services/pancake";

export default class FrappePancakeLeadOwnerAssignmentController {
  static async create(ctx) {
    const data = await ctx.req.json();
    const conversationAssignmentService = new Pancake.ConversationAssignmentService(ctx.env);
    const result = await conversationAssignmentService.syncConversationAssigneesWithLeadOwner(data);
    return ctx.json({ success: !!result, data: result });
  }
}
