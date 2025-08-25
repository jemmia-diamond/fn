import HaravanAPIClient from "services/haravan/api-client/api-client";
import LarksuiteService from "services/larksuite/lark";
import { CHAT_GROUPS } from "services/larksuite/group-chat/group-management/constant";
import { negativeStockOrderMessage } from "services/haravan/orders/order-service/helpers/messages-compose";

export default class OrderService {
  constructor(env) {
    this.env = env;
    this.hrvClient = new HaravanAPIClient(env);
    this.larkClient = LarksuiteService.createClient(env);
  }

  async invalidOrderNotification(order) {
    const jewelrySKULength = 21;
    const jewelryVariants = order.line_items.filter(item => item.sku.toString().length === jewelrySKULength);
    const negativeOrderedVariants = [];
    for (const jewelryVariant of jewelryVariants) {
      const productData = (await this.hrvClient.products.product.getProduct(jewelryVariant.product_id)).data.product;
      const variants = productData.variants;
      const targetVariant = variants.find(variant => variant.id === jewelryVariant.variant_id);
      if (targetVariant.inventory_advance.qty_available < 0) {
        negativeOrderedVariants.push(jewelryVariant);
      }

      if (negativeOrderedVariants.length > 0) {
        const message = negativeStockOrderMessage(order, negativeOrderedVariants);
        await this.larkClient.im.message.create({
          params: {
            receive_id_type: "chat_id"
          },
          data: {
            receive_id: CHAT_GROUPS.NEGATIVE_STOCK_ORDERING_CONTROLL.chat_id,
            msg_type: "text",
            content: JSON.stringify({
              text: message
            })
          }
        });
      }
    }
  }

  static async dequeueOrderQueue(batch, env) {
    const orderService = new OrderService(env);
    for (const message of batch.messages) {
      try {
        const data = message.body.order;
        await orderService.invalidOrderNotification(data, env);
      }
      catch (error) {
        console.error(error);
      }
    }
  }
}
