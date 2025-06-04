import BaseClient from "../base-client";

export default class UserClient extends BaseClient {
  constructor({ appId, appSecret }) {
    super({ appId, appSecret });
  }

  async findByDepartment({ user_id_type, department_id_type, department_id, page_size }) {
    const path = "/contact/v3/users/find_by_department";
    return await this.getRequest(path, { user_id_type, department_id_type, department_id, page_size });
  }

  async findAllByDepartment({ user_id_type, department_id_type, department_id }) {
    const users = [];
    let continued = true;
    do {
      const response = await this.findByDepartment({ user_id_type, department_id_type, department_id, page_size: 50 });
      if (response.items) {
        users.push(...response.items);
      }
      if (!response.has_more) {
        continued = false;
      }
    } while (continued);
    return {
      items: users
    };
  }
}
