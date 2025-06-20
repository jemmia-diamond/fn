import ConversationService from "../../../../services/pancake/conversation/conversation";

export default class PancakeERPMessageController {
  static async create(ctx) {
    const payload = await ctx.req.json();
    
    const data = payload.data;
    const conversationService = new ConversationService(ctx.env);
    await conversationService.processLastCustomerMessage(data);
    return ctx.json({ message: "Message Received" });
  }
}
