import UserClient from "../../../../larksuite/modules/contact/user";
import { neon } from "@neondatabase/serverless";

export default class UserService {
  constructor(env) {
    this.env = env;
    this.userClient = new UserClient({ appId: env.LARKSUITE_APP_ID, appSecret: env.LARKSUITE_APP_SECRET });
    this.dbConnector = neon(env.DATABASE_URL);
  }

  static async syncUsersToDatabase(env) {
    const userService = new UserService(env);

    const departements = await userService.dbConnector.query(`
            SELECT
            department_id
            FROM larksuite.departments
        `);
    const departement_ids = departements.map(departement => departement.department_id);
        
    const allUsers = [];
    for (const departement_id of departement_ids) {
      const users = await userService.userClient.findAllByDepartment({
        user_id_type: "user_id",
        department_id_type: "department_id",
        department_id: departement_id
      });
      allUsers.push(...users.items);
    }

    // Insert users into larksuite.users table
    for (const user of allUsers) {
      // Upsert user by user_id
      await userService.dbConnector.query(`
                INSERT INTO larksuite.users (
                    user_id, open_id, union_id, name, en_name, email, enterprise_email, 
                    department_ids, job_title, city, country, gender, leader_user_id, 
                    join_time, is_tenant_manager, work_station, description, employee_no, employee_type,
                    status_is_activated, status_is_exited, status_is_frozen, status_is_resigned, status_is_unjoin
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
                )
                ON CONFLICT (user_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    email = EXCLUDED.email,
                    enterprise_email = EXCLUDED.enterprise_email,
                    department_ids = EXCLUDED.department_ids,
                    job_title = EXCLUDED.job_title,
                    city = EXCLUDED.city,
                    country = EXCLUDED.country,
                    gender = EXCLUDED.gender,
                    open_id = EXCLUDED.open_id,
                    union_id = EXCLUDED.union_id,
                    leader_user_id = EXCLUDED.leader_user_id,
                    join_time = EXCLUDED.join_time,
                    is_tenant_manager = EXCLUDED.is_tenant_manager,
                    work_station = EXCLUDED.work_station,
                    description = EXCLUDED.description,
                    employee_no = EXCLUDED.employee_no,
                    employee_type = EXCLUDED.employee_type,
                    status_is_activated = EXCLUDED.status_is_activated,
                    status_is_exited = EXCLUDED.status_is_exited,
                    status_is_frozen = EXCLUDED.status_is_frozen,
                    status_is_resigned = EXCLUDED.status_is_resigned,
                    status_is_unjoin = EXCLUDED.status_is_unjoin
            `, [
        user.user_id,
        user.open_id,
        user.union_id,
        user.name,
        user.en_name,
        user.email,
        user.enterprise_email,
        user.department_ids ? `{${user.department_ids.join(",")}}` : null,
        user.job_title,
        user.city,
        user.country,
        user.gender,
        user.leader_user_id,
        user.join_time,
        user.is_tenant_manager,
        user.work_station,
        user.description,
        user.employee_no,
        user.employee_type,
        user.status.is_activated,
        user.status.is_exited,
        user.status.is_frozen,
        user.status.is_resigned,
        user.status.is_unjoin
      ]);
    }
  }
}
