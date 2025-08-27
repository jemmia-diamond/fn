/* eslint no-console: "off" */

import ERP from "src/services/erp";
import Pancake from "src/services/pancake";
import ProductQuote from "src/services/product_quote";
import Ecommerce from "src/services/ecommerce";
import Haravan from "src/services/haravan";

export default {
  queue: async (batch, env) => {
    console.log(JSON.stringify(batch.messages));
    switch (batch.queue) {
    case "order":
      await Ecommerce.SendZaloMessage.dequeueSendZaloDeliveryMessageQueue(batch, env);
      await Haravan.OrderModule.OrderService.dequeueOrderQueue(batch, env);
      await ProductQuote.ProductQuoteOrderService.dequeueOrderQueue(batch, env);
      await Ecommerce.IndDayStatService.trackBudget(batch, env);
      await ERP.Selling.SalesOrderService.dequeueOrderQueue(batch, env);
      break;
    case "message":
      await Pancake.ConversationService.dequeueMessageSummaryQueue(batch, env);
      await Pancake.ConversationService.dequeueMessageQueue(batch, env);
      break;
    case "zalo-message":
      await Ecommerce.SendZaloMessage.dequeueSendZaloMessageQueue(batch, env);
      await Ecommerce.SendZaloMessage.dequeueSendZaloRemindPayMessageQueue(batch, env);
      break;
    case "erpnext-contacts":
      await ERP.Contacts.ContactService.dequeueContactQueue(batch, env);
      break;
    default:
      break;
    }
  }
};
