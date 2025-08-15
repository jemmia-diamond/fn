/* eslint no-console: "off" */

import ERP from "src/services/erp";
import Ecommerce from "src/services/ecommerce";

export default {
  queue: async (batch, env) => {
    console.log(JSON.stringify(batch));
    switch (batch.queue) {
    case "order":
      await Ecommerce.IndDayStatService.trackBudget(batch, env);
      await ERP.Selling.SalesOrderService.dequeueOrderQueue(batch, env);
      break;
    case "message":
      await Pancake.ConversationService.dequeueMessageQueue(batch, env);
      break;
    case "zalo-message":
      await Ecommerce.SendZaloMessage.dequeueOrderQueue(batch, env);
      break;
    default:
      break;
    }
  }
};
