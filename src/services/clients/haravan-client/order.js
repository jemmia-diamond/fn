import BaseConnector from "services/clients/haravan-client/base-connector";

class OrderConnector extends BaseConnector {
  async getOrders(options = {}) {
    return this.get("/orders.json", options);
  }

  async countOrders() {
    return this.get("/orders/count.json");
  }

  async getOrder(orderId) {
    return this.get(`/orders/${orderId}.json`);
  }

  async createOrder(orderData) {
    return this.post("/orders.json", { order: orderData });
  }

  async updateOrder(orderId, orderData) {
    return this.put(`/orders/${orderId}.json`, { order: orderData });
  }

  async confirmOrder(orderId) {
    return this.post(`/orders/${orderId}/confirm.json`, {});
  }

  async closeOrder(orderId) {
    return this.post(`/orders/${orderId}/close.json`, {});
  }

  async openOrder(orderId) {
    return this.post(`/orders/${orderId}/open.json`, {});
  }

  async cancelOrder(orderId, cancelData) {
    return this.post(`/orders/${orderId}/cancel.json`, cancelData);
  }

  async addOrderTags(orderId, tags) {
    return this.post(`/orders/${orderId}/tags.json`, { tags });
  }

  async deleteOrderTags(orderId, tags) {
    return this.delete(`/orders/${orderId}/tags.json`, { tags });
  }

  async assignOrder(orderId, assignData) {
    return this.post(`/orders/${orderId}/assign.json`, assignData);
  }
}

export default OrderConnector;
