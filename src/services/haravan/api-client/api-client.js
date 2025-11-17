import ProductModule from "services/haravan/api-client/modules/products";
import OrderModule from "services/haravan/api-client/modules/orders";
import OrderTransactionModule from "services/haravan/api-client/modules/order-transactions";

export default class HaravanAPIClient {
  constructor(env) {
    this.products = new ProductModule(env);
    this.orders = new OrderModule(env);
    this.orderTransactions = new OrderTransactionModule(env);
  }
}
