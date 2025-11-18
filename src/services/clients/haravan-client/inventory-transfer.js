import BaseConnector from "services/clients/haravan-client/base-connector";

class InventoryTransferConnector extends BaseConnector {
  async getInventoryTransfers(options = {}) {
    return this.get("/inventory_transfers.json", options);
  }

  async getInventoryTransfer(transferId) {
    return this.get(`/inventory_transfers/${transferId}.json`);
  }

  async createInventoryTransfer(transferData) {
    return this.post("/inventory_transfers.json", { inventory_transfer: transferData });
  }
}

export default InventoryTransferConnector;
