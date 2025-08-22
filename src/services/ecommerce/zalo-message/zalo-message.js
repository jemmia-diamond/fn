import ZNSMessageService from "services/zalo-message/zalo-message";
import { GetTemplateZalo } from "services/ecommerce/zalo-message/utils/format-template-zalo";
import { ZALO_TEMPLATE } from "services/ecommerce/zalo-message/enums/zalo-template.enum";

export default class SendZaloMessage {
  constructor(env) {
    this.env = env;
  }
  static whitelistPhones = ["0862098011", "0829976232"];

  static async sendZaloMessage(phone, templateId, templateData, env) {
    try {
      const messageService = new ZNSMessageService(env);
      return await messageService.sendMessage(phone, templateId, templateData);
    } catch (error) {
      console.error("Error sending Zalo message:", error);
      throw new Error("Failed to send Zalo message");
    }
  }

  static async dequeueSendZaloMessageQueue(batch, env) {
    const messages = batch.messages;
    for (const message of messages) {
      if (!this.whitelistPhones.includes(message.body.billing_address?.phone)) {
        return;
      }

      const templateId = ZALO_TEMPLATE.orderConfirmed;
      const result = GetTemplateZalo.getTemplateZalo(templateId, message.body);
      if (result) {
        await this.sendZaloMessage(result.phone, templateId, result.templateData, env);
      }
    }
  }
}
