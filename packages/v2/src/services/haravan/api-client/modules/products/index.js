import ProductClient from "services/haravan/api-client/modules/products/product-client";
import CollectClient from "services/haravan/api-client/modules/products/collect-client";
import ProductVariantClient from "services/haravan/api-client/modules/products/product-variant-client";

export default class ProductModule {
  constructor(env) {
    this.product = new ProductClient(env);
    this.collect = new CollectClient(env);
    this.productVariant = new ProductVariantClient(env);
  }
}
