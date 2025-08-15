import {ZALO_TEMPLATE} from "services/ecommerce/zalo-message/enums/zalo-template.enum";
import {ORDER_STATUS} from "services/ecommerce/zalo-message/enums/order-status.enum";

export class GetTemplateZalo {
  static getTemplateZalo(templateId, data) {
    switch (templateId) {
    case ZALO_TEMPLATE.orderConfirmed:
      return {
        phone: this.convertPhoneNumber(data.billing_address?.phone),
        templateData: {
          order_number: data.name,
          address: data.billing_address?.address_1,
          product: data.line_items?.[0]?.title,
          price: data.total_price,
          status: ORDER_STATUS.PAID,
          date: data.created_at && new Date(data.created_at).toLocaleDateString("vi-VN")
        }
      };

    default:
      return null;
    }
  }

  static convertPhoneNumber(phone) {
    if (!phone) return null;

    if (phone.startsWith("0")) return `+84${phone.slice(1)}`;
    else if (phone.startsWith("84")) return `+${phone}`;
    else if (phone.startsWith("+84")) return phone;
    return null;
  }
}
