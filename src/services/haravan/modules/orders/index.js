import { OrderClient } from "services/haravan/modules/orders/order-client";

export class OrderModule {
  constructor(env) {
    this.order = new OrderClient(env);
  }
}
