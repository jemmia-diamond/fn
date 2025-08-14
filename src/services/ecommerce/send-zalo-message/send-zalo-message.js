import ZNSMessageService from "services/zalo-message/zalo-message";

export default class SendZaloMessage {
  constructor(env) {
    this.env = env;
  }
  
  async sendMessage(phone, templateId, templateData) {
    try {
      const messageService = new ZNSMessageService(this.env);
      return await messageService.sendMessage(phone, templateId, templateData);
    } catch (error) {
      console.error("Error sending Zalo message:", error);
      throw new Error("Failed to send Zalo message");
    }
  }

  async dequeueOrderQueue(batch) {
    const messages = batch.messages;
    for (const message of messages) {
      const { phone, templateId, templateData } = message.body;
      await this.sendMessage(phone, templateId, templateData);
    }
  }
}
