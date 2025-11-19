import BaseConnector from "services/clients/haravan-client/base-connector";

class CollectConnector extends BaseConnector {
  async getCollects(options = {}) {
    return this.get("/collects.json", options);
  }

  async getCollect(collectId) {
    return this.get(`/collects/${collectId}.json`);
  }

  async createCollect(collectData) {
    return this.post("/collects.json", { collect: collectData });
  }

  async deleteCollect(collectId) {
    return this.delete(`/collects/${collectId}.json`);
  }
}

export default CollectConnector;
