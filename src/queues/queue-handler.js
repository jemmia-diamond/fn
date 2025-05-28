import OrderService from "../services/erp/order";

export default {
  queue: async (batch, env) => {
    switch (batch.queue) {
    case "order":
      await OrderService.decodeOrderQueue(batch, env);
      break;
    default:
      break;
    }
  }
};
