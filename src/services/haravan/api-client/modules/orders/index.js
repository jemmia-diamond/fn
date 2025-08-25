import OrderClient from "services/haravan/api-client/modules/orders/order-client";

export default class OrderModule {
  constructor(env) {
    this.order = new OrderClient(env);
  }
}
