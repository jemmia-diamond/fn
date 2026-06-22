import BaseConnector from "services/clients/haravan-client/base-connector";

class PromotionConnector extends BaseConnector {
  async getPromotions(options = {}) {
    return this.get("/promotions.json", options);
  }

  async getPromotion(promotionId) {
    return this.get(`/promotions/${promotionId}.json`);
  }

  async createPromotion(promotionData) {
    return this.post("/promotions.json", { promotion: promotionData });
  }

  async updatePromotion(promotionId, promotionData) {
    return this.put(`/promotions/${promotionId}.json`, { promotion: promotionData });
  }

  async deletePromotion(promotionId) {
    return this.delete(`/promotions/${promotionId}.json`);
  }
}

export default PromotionConnector;
