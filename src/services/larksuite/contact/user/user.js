import LarksuiteService from "../../lark";
import Database from "../../../database";
import * as lark from "@larksuiteoapi/node-sdk";

export default class UserService {
  static async syncUsersToDatabase(env) {
    const db = Database.instance(env);
    const larkClient = LarksuiteService.createClient(env);
    const tenantAccessToken = await LarksuiteService.getTenantAccessToken(env);

    // Get all departments ids from database
    const departementIds = await UserService.getDepartmentIds(env);
    // Get all users from each department
    const usersArrays = await Promise.all(departementIds.map(departmentId => UserService.findUsersByDepartment(larkClient, tenantAccessToken, departmentId)));
    const users = usersArrays.flat().filter(Boolean);
    // Insert users into database
    for (const user of users) {
      await db.$queryRaw`INSERT INTO larksuite.users (user_id, name, email, avatar) 
      VALUES (${user.user_id}, ${user.name}, ${user.email}, ${user.avatar})
      ON CONFLICT (user_id) DO UPDATE SET name = ${user.name}, email = ${user.email}, avatar = ${user.avatar}`;
    }
  }

  static async getDepartmentIds(env) {
    const db = Database.instance(env);
    const departements = await db.$queryRaw`SELECT department_id FROM larksuite.departments`;
    return departements.map(departement => departement.department_id);
  }

  static async findUsersByDepartment(larkClient, tenantAccessToken, departmentId) {
    const reponse = await larkClient.contact.user.findByDepartment({
      params: {
        user_id_type: "user_id",
        department_id_type: "department_id",
        department_id: departmentId,
        page_size: 50
      }
    },
    lark.withTenantToken(tenantAccessToken)
    );
    const users = reponse.data.items;
    return users;
  }
}
