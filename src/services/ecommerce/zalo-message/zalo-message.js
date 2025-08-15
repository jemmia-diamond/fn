import ZNSMessageService from "services/zalo-message/zalo-message";
import { GetTemplateZalo } from "services/ecommerce/zalo-message/utils/format-template-zalo";

export default class SendZaloMessage {
  constructor(env) {
    this.env = env;
  }

  static async sendZaloMessage(phone, templateId, templateData, env) {
    try {
      const messageService = new ZNSMessageService(env);
      return await messageService.sendMessage(phone, templateId, templateData);
    } catch (error) {
      console.error("Error sending Zalo message:", error);
      throw new Error("Failed to send Zalo message");
    }
  }

  static async dequeueOrderQueue(batch, env) {
    const messages = batch.messages;
    for (const message of messages) {
      const templateId = message.body.template_id;
      const result = GetTemplateZalo.getTemplateZalo(templateId, message.body);
      if (result) {
        await this.sendZaloMessage(result.phone, templateId, result.templateData, env);
      }
    }
  }
}
