import LarksuiteService from "services/larksuite/lark";
import Database from "services/database";

export default class UserService {
  static async syncUsersToDatabase(env) {
    const db = Database.instance(env);
    const larkClient = LarksuiteService.createClient(env);
    const pageSize = 50;
    const usersArrays = [];

    // Get all departments ids from database
    const departmentIds = await UserService.getDepartmentIds(env);

    for (const departmentId of departmentIds) {
      const payload = {
        params: {
          user_id_type: "user_id",
          department_id_type: "department_id",
          department_id: departmentId
        }
      };

      const responses = await LarksuiteService.requestWithPagination(
        larkClient.contact.user.findByDepartment,
        payload,
        pageSize
      );
      
      const users = responses.flatMap(res => (res?.data?.items || []));
      usersArrays.push(...users);
    }

    // Insert users into database
    for (const user of usersArrays) {
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
}
