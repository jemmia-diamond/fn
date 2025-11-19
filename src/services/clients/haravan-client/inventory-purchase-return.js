import BaseConnector from "services/clients/haravan-client/base-connector";

class InventoryPurchaseReturnConnector extends BaseConnector {
  async getPurchaseReturns(options = {}) {
    return this.get("/purchase_returns.json", options);
  }

  async getPurchaseReturn(returnId) {
    return this.get(`/purchase_returns/${returnId}.json`);
  }

  async createPurchaseReturn(returnData) {
    return this.post("/purchase_returns.json", { purchase_return: returnData });
  }
}

export default InventoryPurchaseReturnConnector;
