import BaseConnector from "services/clients/haravan-client/base-connector";

class InventoryLocationConnector extends BaseConnector {
  async getInventoryLocations(options = {}) {
    return this.get("/inventory_locations.json", options);
  }

  async getInventoryLocation(locationId) {
    return this.get(`/inventory_locations/${locationId}.json`);
  }
}

export default InventoryLocationConnector;
