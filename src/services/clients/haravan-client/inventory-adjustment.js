import BaseConnector from "services/clients/haravan-client/base-connector";

class InventoryAdjustmentConnector extends BaseConnector {
  async getInventoryAdjustments(options = {}) {
    return this.get("/inventory_adjustments.json", options);
  }

  async getInventoryAdjustment(adjustmentId) {
    return this.get(`/inventory_adjustments/${adjustmentId}.json`);
  }

  async createInventoryAdjustment(adjustmentData) {
    return this.post("/inventory_adjustments.json", { inventory_adjustment: adjustmentData });
  }
}

export default InventoryAdjustmentConnector;
