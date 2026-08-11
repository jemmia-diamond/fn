import ProductModule from "services/haravan/api-client/modules/products/product-client";
import OrderModule from "services/haravan/api-client/modules/orders/order-client";
import ProductVariantModule from "services/haravan/api-client/modules/products/product-variant-client";

export default class HaravanAPIClient {
  constructor(env) {
    this.products = new ProductModule(env);
    this.orders = new OrderModule(env);
    this.productVariants = new ProductVariantModule(env);
  }
}
