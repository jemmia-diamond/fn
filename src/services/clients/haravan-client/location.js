import BaseConnector from "services/clients/haravan-client/base-connector";

class LocationConnector extends BaseConnector {
  async getLocations(options = {}) {
    return this.get("/locations.json", options);
  }

  async getLocation(locationId) {
    return this.get(`/locations/${locationId}.json`);
  }
}

export default LocationConnector;
