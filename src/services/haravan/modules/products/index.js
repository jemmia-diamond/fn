import { ProductClient } from "services/haravan/modules/products/product-client";
import { CollectClient } from "services/haravan/modules/products/collect-client";

export class ProductModule {
  constructor(env) {
    this.product = new ProductClient(env);
    this.collect = new CollectClient(env);
  }
}
