import { ProductModule } from "services/haravan/modules/products";

export class HaravanAPIClient {
  constructor(env) {
    this.products = new ProductModule(env);
  }
}
