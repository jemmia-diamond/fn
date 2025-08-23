import ZNSMessageService from "services/zalo-message/zalo-message";
import { GetTemplateZalo } from "services/ecommerce/zalo-message/utils/format-template-zalo";
import { ZALO_TEMPLATE } from "services/ecommerce/zalo-message/enums/zalo-template.enum";

export default class SendZaloMessage {
  constructor(env) {
    this.env = env;
  }
  static whitelistPhones = ["0862098011", "0829976232"];
  static whitelistSource = "web";

  static async sendZaloMessage(phone, templateId, templateData, env) {
    try {
      const messageService = new ZNSMessageService(env);
      return await messageService.sendMessage(phone, templateId, templateData);
    } catch (error) {
      console.error("Error sending Zalo message:", error);
      throw new Error("Failed to send Zalo message");
    }
  }

  static eligibleForSendingZaloMessage(message) {
    if (this.whitelistSource.includes(message?.source)
        && this.whitelistPhones.includes(message?.billing_address?.phone 
        && message.ref_order_id === 0)) {
      return true;
    }

    return false;
  }

  static async dequeueSendZaloMessageQueue(batch, env) {
    const messages = batch.messages;
    for (const message of messages) {
      if (!eligibleForSendingZaloMessage(message.body)) {
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
