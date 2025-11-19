import BaseConnector from "services/clients/haravan-client/base-connector";

class InventoryPurchaseReceiveConnector extends BaseConnector {
  async getPurchaseReceives(options = {}) {
    return this.get("/purchase_receives.json", options);
  }

  async getPurchaseReceive(receiveId) {
    return this.get(`/purchase_receives/${receiveId}.json`);
  }

  async createPurchaseReceive(receiveData) {
    return this.post("/purchase_receives.json", { purchase_receive: receiveData });
  }
}

export default InventoryPurchaseReceiveConnector;
