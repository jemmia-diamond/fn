import OrderService from "../services/erp/order";

export default {
  queue: async (batch, env) => {
    switch (batch.queue) {
    case "order":
      await OrderService.dequeueOrderQueue(batch, env);
      break;
    default:
      break;
    }
  }
};
