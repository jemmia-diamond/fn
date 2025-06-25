import PancakeClient from "../../../pancake/pancake-client";
import Database from "../../database";

export default class ConversationService {
  constructor(env) {
    this.env = env;
    this.pancakeClient = new PancakeClient(env.PANCAKE_ACCESS_TOKEN);
    this.db = Database.instance(env);
  }

  async updateConversation(conversationId, pageId, insertedAt) {
    const result = await this.db.$queryRaw`
            UPDATE pancake.conversation c
            SET last_sent_at = ${insertedAt}
            WHERE c.id = ${conversationId} AND c.page_id = ${pageId};
        `;
    return result;
  }

  async processLastCustomerMessage(data) {
    const message = data.message;
    const from = message.from;
    if (!from?.admin_id) {
      // Not processing messages from admin
      return;
    }
    const conversationId = message.conversation_id;
    const pageId = message.page_id;
    const insertedAt = message.inserted_at;

    if (!conversationId || !pageId || !insertedAt) {
      throw new Error("Page ID: " + pageId + ", Conversation ID: " + conversationId + ", Inserted At: " + insertedAt);
    }
    // Store the time of the last customer message
    const result = await this.updateConversation(conversationId, pageId, insertedAt);
    return result;
  }

  static async dequeueMessageQueue(batch, env) {
    const conversationService = new ConversationService(env);
    const messages = batch.messages;
    for (const message of messages) {
      const data = message.body;
      await conversationService.processLastCustomerMessage(data.data);
    }
  }
}
