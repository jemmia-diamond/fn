/* eslint no-console: "off" */

import ERP from "../services/erp";
import Pancake from "../services/pancake";

export default {
  queue: async (batch, env) => {
    console.log(JSON.stringify(batch.messages));
    switch (batch.queue) {
    case "order":
      await ERP.Selling.OrderService.dequeueOrderQueue(batch, env);
      break;
    case "message":
      await Pancake.ConversationService.dequeueMessageQueue(batch, env);
      break;
    default:
      break;
    }
  }
};
