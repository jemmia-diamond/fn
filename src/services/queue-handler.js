/* eslint no-console: "off" */

import Pancake from "src/services/pancake";
import Ecommerce from "src/services/ecommerce";
import Haravan from "src/services/haravan";

export default {
  queue: async (batch, env) => {
    // console.log(JSON.stringify(batch.messages));
    switch (batch.queue) {
    case "order":
      await Haravan.OrderModule.OrderService.dequeueOrderQueue(batch, env);
      // await ProductQuote.ProductQuoteOrderService.dequeueOrderQueue(batch, env);
      // await Ecommerce.IndDayStatService.trackBudget(batch, env);
      // await ERP.Selling.SalesOrderService.dequeueOrderQueue(batch, env);
      break;
    case "message":
      await Pancake.ConversationService.dequeueMessageQueue(batch, env);
      break;
    case "zalo-message":
      await Ecommerce.SendZaloMessage.dequeueSendZaloMessageQueue(batch, env);
      break;
    default:
      break;
    }
  }
};
