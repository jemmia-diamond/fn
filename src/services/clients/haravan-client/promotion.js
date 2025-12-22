import BaseConnector from "services/clients/haravan-client/base-connector";

class PromotionConnector extends BaseConnector {
  async create(promotionData) {
    return this.post("/promotions.json", { promotion: promotionData });
  }

  async list(options = {}) {
    return super.get("/promotions.json", options);
  }

  async get(id) {
    return super.get(`/promotions/${id}.json`);
  }

  async update(id, promotionData) {
    return super.put(`/promotions/${id}.json`, { promotion: promotionData });
  }

  async delete(id) {
    return super.delete(`/promotions/${id}.json`);
  }
}

export default PromotionConnector;
