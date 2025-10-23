import FrappeClient from "frappe/frappe-client";
import Database from "services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class UserService {
  static ERPNEXT_PAGE_SIZE = 100;
  constructor(env) {
    this.env = env;
    this.doctype = "User";
    this.frappeClient = new FrappeClient({
      url: this.env.JEMMIA_ERP_BASE_URL,
      apiKey: this.env.JEMMIA_ERP_API_KEY,
      apiSecret: this.env.JEMMIA_ERP_API_SECRET,
    });
    this.db = Database.instance(env);
  }

  async getPancakeUsers() {
    const users = this.db
      .$queryRaw`SELECT u.id,u.enterprise_email FROM pancake.users u `;
    return users;
  }

  static async syncLarkIds(env) {
    const userService = new UserService(env);
    const users = await userService.frappeClient.getList(userService.doctype, {
      filters: [["pancake_id", "=", null]],
    });

    const pancakeUsers = await userService.getPancakeUsers();
    for (const user of users) {
      const pancakeUser = pancakeUsers.find(
        (pancakeUser) => pancakeUser.enterprise_email === user.email,
      );
      if (pancakeUser) {
        await userService.frappeClient.update({
          doctype: userService.doctype,
          name: user.name,
          pancake_id: pancakeUser.id,
        });
      }
    }
  }

  static async syncUsersToDatabase(env) {
    const timeThreshold = dayjs()
      .subtract(1, "day")
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
    const userService = new UserService(env);

    let users = [];
    let page = 1;
    const pageSize = UserService.ERPNEXT_PAGE_SIZE;
    while (true) {
      const result = await userService.frappeClient.getList(
        userService.doctype,
        {
          limit_start: (page - 1) * pageSize,
          limit_page_length: pageSize,
          filters: [["modified", ">=", timeThreshold]],
        },
      );
      users = users.concat(result);
      if (result.length < pageSize) break;
      page++;
    }

    for (const user of users) {
      const userData = {
        name: user.name,
        email: user.email,
        creation: new Date(user.creation),
        modified: new Date(user.modified),
        modified_by: user.modified_by,
        enabled: user.enabled,
        full_name: user.full_name,
        language: user.language,
        time_zone: user.time_zone,
        user_image: user.user_image,
        role_profile: user.role_profile,
        gender: user.gender,
        birth_date: new Date(user.birth_date),
        location: user.location,
        pancake_id: user.pancake_id,
      };
      await userService.db.erpnextUser.upsert({
        where: {
          name: userData.name,
        },
        update: userData,
        create: userData,
      });
    }
  }
}
