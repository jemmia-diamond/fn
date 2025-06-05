import UserClient from "../../../../larksuite/modules/contact/user";
import Database from "../../../database";

export default class UserService {
  constructor(env) {
    this.env = env;
    this.userClient = new UserClient({ appId: env.LARKSUITE_APP_ID, appSecret: env.LARKSUITE_APP_SECRET });
  }

  static async syncUsersToDatabase(env) {
    const userService = new UserService(env);
    const db = Database.instance(env);

    const departements = await db.$queryRaw`SELECT department_id FROM larksuite.departments`;
    const departement_ids = departements.map(departement => departement.department_id);

    console.log(departement_ids);
        
    // const allUsers = [];
    // for (const departement_id of departement_ids) {
    //   const users = await userService.userClient.findAllByDepartment({
    //     user_id_type: "user_id",
    //     department_id_type: "department_id",
    //     department_id: departement_id
    //   });
    //   allUsers.push(...users.items);
    // } 
  }
}
