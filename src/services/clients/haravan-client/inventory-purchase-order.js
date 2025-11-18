import BaseConnector from "services/clients/haravan-client/base-connector";

class InventoryPurchaseOrderConnector extends BaseConnector {
  async getPurchaseOrders(options = {}) {
    return this.get("/purchase_orders.json", options);
  }

  async getPurchaseOrder(orderId) {
    return this.get(`/purchase_orders/${orderId}.json`);
  }

  async createPurchaseOrder(orderData) {
    return this.post("/purchase_orders.json", { purchase_order: orderData });
  }

  async updatePurchaseOrder(orderId, orderData) {
    return this.put(`/purchase_orders/${orderId}.json`, { purchase_order: orderData });
  }
}

export default InventoryPurchaseOrderConnector;
