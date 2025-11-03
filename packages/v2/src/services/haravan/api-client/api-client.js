import ProductModule from "services/haravan/api-client/modules/products";
import OrderModule from "services/haravan/api-client/modules/orders";

export default class HaravanAPIClient {
  constructor(env) {
    this.products = new ProductModule(env);
    this.orders = new OrderModule(env);
  }
}
