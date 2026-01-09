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
      const userData = {
        user_id: user.user_id,
        open_id: user.open_id,
        union_id: user.union_id,
        name: user.name,
        en_name: user.en_name,
        email: user.email,
        enterprise_email: user.enterprise_email,
        gender: user.gender,
        city: user.city,
        country: user.country,
        department_ids: user.department_ids,
        description: user.description,
        employee_no: user.employee_no,
        employee_type: user.employee_type,
        is_tenant_manager: user.is_tenant_manager,
        job_title: user.job_title,
        join_time: user.join_time ? BigInt(user.join_time) : null,
        leader_user_id: user.leader_user_id,
        work_station: user.work_station,
        status_is_activated: user.status?.is_activated,
        status_is_exited: user.status?.is_exited,
        status_is_frozen: user.status?.is_frozen,
        status_is_resigned: user.status?.is_resigned,
        status_is_unjoin: user.status?.is_unjoin,
        avatar: user.avatar
      };

      const updateData = { ...userData };
      if (!user.department_ids || (Array.isArray(user.department_ids) && user.department_ids.length === 0)) {
        delete updateData.department_ids;
      }

      await db.larksuite_users.upsert({
        where: { user_id: user.user_id },
        create: userData,
        update: updateData
      });
    }
  }

  static async getDepartmentIds(env) {
    const db = Database.instance(env);
    const departements = await db.$queryRaw`SELECT department_id FROM larksuite.departments`;
    return departements.map(departement => departement.department_id);
  }
}
