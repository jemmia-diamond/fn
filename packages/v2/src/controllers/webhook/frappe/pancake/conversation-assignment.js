import Pancake from "services/pancake";

export default class FrappePancakeConversationAssignmentController {
  static async create(ctx) {
    const data = await ctx.req.json();
    const conversationAssignmentService =
      new Pancake.ConversationAssignmentService(ctx.env);
    const result =
      await conversationAssignmentService.syncConversationAssigneesWithERPToDo(
        data
      );
    return ctx.json({ success: !!result, data: result });
  }
}
