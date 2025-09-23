import { ZALO_TEMPLATE } from "services/ecommerce/zalo-message/enums/zalo-template.enum";
import { ORDER_STATUS } from "src/services/ecommerce/zalo-message/enums/order-status.enum";

export class GetTemplateZalo {
  static getTemplateZalo(templateId, data, extraParams = {}) {
    switch (templateId) {
    case ZALO_TEMPLATE.orderConfirmed:
      return {
        phone: this.convertPhoneNumber(data.billing_address?.phone),
        templateData: {
          name: data.billing_address?.name,
          order_number: String(data.id),
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
      const trackingRedirectPath = extraParams.trackingRedirectPath || "";
      return {
        phone: this.convertPhoneNumber(data.billing_address?.phone),
        templateData: {
          customer_name: data.billing_address?.name,
          order_number: String(data.id),
          name: trackingRedirectPath
        }
      };
    case ZALO_TEMPLATE.remindPay:
      // For ViettinBank, Transfer Note must have prefix "SEVQR "
      const bankTransferNote = `SEVQR ${data.order_number}`;
      const messageNote = "Thanh toán cọc 30% đơn hàng";
      const transferAmount = Math.round(parseInt(data.total_price) / 100 * 30);
      return {
        phone: this.convertPhoneNumber(data.billing_address?.phone),
        templateData: {
          customer_name: data.billing_address?.name,
          price: data.total_price.toLocaleString("vi-VN"),
          transfer_amount: transferAmount,
          order_number: String(data.id),
          note: messageNote,
          bank_transfer_note: bankTransferNote
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
