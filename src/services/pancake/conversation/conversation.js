import dayjs from "dayjs";
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
            WHERE c.id = ${conversationId} AND c.page_id = ${pageId};`;
    return result;
  }

  isFromCustomer = (from) => {
    if (from.admin_id) {
      return false;
    }
    return true;
  };

  async processLastCustomerMessage(data) {
    const message = data.message;
    const from = message.from;
    if (!this.isFromCustomer(from)) {
      // Not processing messages from admin
      return;
    }
    const conversationId = message.conversation_id;
    const pageId = message.page_id;
    const insertedAt = dayjs(message.inserted_at).format("YYYY-MM-DD HH:mm:ss");
    // Store the time of the last customer message
    await this.updateConversation(conversationId, pageId, insertedAt);
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
