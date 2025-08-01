/* eslint no-console: "off" */

import ERP from "src/services/erp";
import Pancake from "src/services/pancake";

export default {
  queue: async (batch, env) => {
    console.log(JSON.stringify(batch.messages));
    switch (batch.queue) {
    case "order":
      await ERP.Selling.SalesOrderService.dequeueOrderQueue(batch, env);
      break;
    case "message":
      await Pancake.ConversationService.dequeueMessageQueue(batch, env);
      break;
    default:
      break;
    }
  }
};
