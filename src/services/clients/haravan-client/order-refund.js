import BaseConnector from "services/clients/haravan-client/base-connector";

class RefundOrderConnector extends BaseConnector {
  async getRefunds(orderId, options = {}) {
    return this.get(`/orders/${orderId}/refunds.json`, options);
  }

  async getRefund(orderId, refundId) {
    return this.get(`/orders/${orderId}/refunds/${refundId}.json`);
  }

  async createRefund(orderId, refundData) {
    return this.post(`/orders/${orderId}/refunds.json`, { refund: refundData });
  }
}

export default RefundOrderConnector;
