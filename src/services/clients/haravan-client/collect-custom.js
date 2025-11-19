import BaseConnector from "services/clients/haravan-client/base-connector";

class CustomCollectConnector extends BaseConnector {
  async getCustomCollects(options = {}) {
    return this.get("/custom_collections.json", options);
  }

  async getCustomCollect(collectId) {
    return this.get(`/custom_collections/${collectId}.json`);
  }

  async createCustomCollect(collectData) {
    return this.post("/custom_collections.json", { custom_collection: collectData });
  }

  async updateCustomCollect(collectId, collectData) {
    return this.put(`/custom_collections/${collectId}.json`, { custom_collection: collectData });
  }

  async deleteCustomCollect(collectId) {
    return this.delete(`/custom_collections/${collectId}.json`);
  }
}

export default CustomCollectConnector;
