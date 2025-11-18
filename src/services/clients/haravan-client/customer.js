import BaseConnector from "services/clients/haravan-client/base-connector";

class CustomerConnector extends BaseConnector {
  async getCustomers(query = null, options = {}) {
    const params = { ...options };
    if (query) params.query = query;
    return this.get("/customers.json", params);
  }

  async searchCustomers(query = null, options = {}) {
    const params = { ...options };
    if (query) params.query = query;
    return this.get("/customers/search.json", params);
  }

  async countCustomers() {
    return this.get("/customers/count.json");
  }

  async getCustomer(customerId) {
    return this.get(`/customers/${customerId}.json`);
  }

  async createCustomer(customerData) {
    return this.post("/customers.json", { customer: customerData });
  }

  async updateCustomer(customerId, customerData) {
    return this.put(`/customers/${customerId}.json`, { customer: customerData });
  }

  async deleteCustomer(customerId) {
    return this.delete(`/customers/${customerId}.json`);
  }

  async addCustomerTags(customerId, tags) {
    return this.post(`/customers/${customerId}/tags.json`, { tags });
  }

  async deleteCustomerTags(customerId, tags) {
    return this.delete(`/customers/${customerId}/tags.json`, { tags });
  }

  async getCustomerGroups() {
    return this.get("/customers/groups.json");
  }
}

export default CustomerConnector;
