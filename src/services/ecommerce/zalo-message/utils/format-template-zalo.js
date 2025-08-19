import {ZALO_TEMPLATE} from "services/ecommerce/zalo-message/enums/zalo-template.enum";

export class GetTemplateZalo {
  static getTemplateZalo(templateId, data) {
    switch (templateId) {
    case ZALO_TEMPLATE.orderConfirmed:
      return {
        phone: this.convertPhoneNumber(data.billing_address?.phone),
        templateData: {
          order_number: data.name,
          name: data.billing_address?.name
        }
      };

    default:
      return null;
    }
  }

  static convertPhoneNumber(phone) {
    if (!phone) return null;

    if (phone.startsWith("0")) return `84${phone.slice(1)}`;
    if (phone.startsWith("84")) return phone;
    if (phone.startsWith("+84")) return phone.slice(1);

    return null;
  }
}
