import OrderModule from "services/haravan/api-client/modules/orders";
import ProductModule from "services/haravan/api-client/modules/products";

export default class HaravanAPIClient {
  constructor(env) {
    this.products = new ProductModule(env);
    this.orders = new OrderModule(env);
  }
}
