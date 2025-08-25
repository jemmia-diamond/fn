import { ProductModule } from "services/haravan/modules/products";
import { OrderModule } from "services/haravan/modules/orders";

export class HaravanAPIClient {
  constructor(env) {
    this.products = new ProductModule(env);
    this.orders = new OrderModule(env);
  }
}
