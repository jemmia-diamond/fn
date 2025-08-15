/* eslint no-console: "off" */

import ERP from "src/services/erp";
import Pancake from "src/services/pancake";
import Ecommerce from "src/services/ecommerce";

export default {
  queue: async (batch, env) => {
    console.log(JSON.stringify(batch.messages));
    switch (batch.queue) {
    case "order":
      await Ecommerce.IndDayStatService.trackBudget(batch, env);
      await ERP.Selling.SalesOrderService.dequeueOrderQueue(batch, env);
      break;
    case "message":
      await Pancake.ConversationService.dequeueMessageQueue(batch, env);
      break;
    case "send_zalo":
      await Ecommerce.SendZaloMessage.dequeueOrderQueue(batch);
    default:
      break;
    }
  }
};
