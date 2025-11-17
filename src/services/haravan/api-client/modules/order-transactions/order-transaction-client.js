import BaseClient from "services/haravan/api-client/base-client";

export default class OrderTransactionClient extends BaseClient {
  constructor(env) {
    super(env);
  }

  async getTransactions(orderId) {
    const path = `/com/orders/${orderId}/transactions.json`;
    return await this.makeGetRequest(path);
  }

  async getTransaction(orderId, transactionId) {
    const path = `/com/orders/${orderId}/transactions/${transactionId}.json`;
    return await this.makeGetRequest(path);
  }

  async createTransaction(orderId, transactionData) {
    const path = `/com/orders/${orderId}/transactions.json`;
    return await this.makePostRequest(path, { "transaction": transactionData });
  }
}
