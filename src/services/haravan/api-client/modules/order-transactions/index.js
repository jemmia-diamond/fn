import OrderTransactionClient from "services/haravan/api-client/modules/order-transactions/order-transaction-client";

export default class OrderTransactionModule {
  constructor(env) {
    this.orderTransaction = new OrderTransactionClient(env);
  }
}
