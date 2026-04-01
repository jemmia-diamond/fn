import BaseConnector from "services/clients/haravan-client/base-connector";

class UserConnector extends BaseConnector {
  async getUsers(options = {}) {
    return this.get("/users.json", options);
  }

  async getUser(userId) {
    return this.get(`/users/${userId}.json`);
  }
}

export default UserConnector;
