import BaseClient from "services/haravan/api-client/base-client";

export default class OrderClient extends BaseClient {
  constructor(env) {
    super(env);
  }

  async getOrder(orderId) {
    const path = `/com/orders/${orderId}.json`;
    return await this.makeGetRequest(path);
  }

  async getListOfOrders() {
    const path = "/com/orders.json";
    return await this.makeGetRequest(path);
  }
}
