import {ZALO_TEMPLATE} from "services/ecommerce/zalo-message/enums/zalo-template.enum";
import { ORDER_STATUS } from "src/services/ecommerce/zalo-message/enums/order-status.enum";

export class GetTemplateZalo {
  static getTemplateZalo(templateId, data) {
    switch (templateId) {
    case ZALO_TEMPLATE.orderConfirmed:
      return {
        phone: this.convertPhoneNumber(data.billing_address?.phone),
        templateData: {
          name: data.billing_address?.name,
          order_number: data.id,
          address: data.billing_address?.address1,
          product: data.line_items[0].title,
          price: data.total_price.toLocaleString("vi-VN"),
          status: ORDER_STATUS.PAID,
          date: new Date(data.created_at).toLocaleDateString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh"
          })
        }
      };
    case ZALO_TEMPLATE.delivering:
      return {
        phone: this.convertPhoneNumber(data.billing_address?.phone),
        templateData: {
          name: data.billing_address?.name,
          order_number: data.id
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
