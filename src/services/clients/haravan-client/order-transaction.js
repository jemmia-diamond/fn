import BaseConnector from "services/clients/haravan-client/base-connector";

class TransactionOrderConnector extends BaseConnector {
  async getTransactions(orderId, options = {}) {
    return this.get(`/orders/${orderId}/transactions.json`, options);
  }

  async getTransaction(orderId, transactionId) {
    return this.get(`/orders/${orderId}/transactions/${transactionId}.json`);
  }

  async createTransaction(orderId, transactionData) {
    return this.post(`/orders/${orderId}/transactions.json`, { transaction: transactionData });
  }
}

export default TransactionOrderConnector;
