import ERP from "../services/erp";

export default {
  queue: async (batch, env) => {
    switch (batch.queue) {
    case "order":
      await ERP.Selling.OrderService.dequeueOrderQueue(batch, env);
      break;
    default:
      break;
    }
  }
};
