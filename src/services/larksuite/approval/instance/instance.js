import LarksuiteService from "services/larksuite/lark";
import Database from "services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { APPROVALS } from "services/larksuite/approval/constant";

dayjs.extend(utc);

export default class InstanceService {
  static async syncInstancesToDatabase(env) {
    const instanceService = new InstanceService(env);
    const db = Database.instance(env);
    const larkClient = LarksuiteService.createClient(env);
    const timeThreshold = dayjs().utc();
    const startTime = timeThreshold.subtract(1, "day").subtract(1, "hour").unix() * 1000;
    const endTime = timeThreshold.add(12, "hour").unix() * 1000;
    const pageSize = 100;

    const approvalCodes = [
      APPROVALS.LEAVE_APPROVAL,
      APPROVALS.PAYMENT_APPROVAL,
      APPROVALS.PURCHASE_APPROVAL,
      APPROVALS.OFFBOARD_APPROVAL
    ];

    const transformedInstances = [];

    for (const approval of approvalCodes) {
      const payload = {
        params: {
          start_time: startTime,
          end_time: endTime,
          approval_code: approval.code,
          page_size: pageSize
        }
      };

      const responses = await LarksuiteService.requestWithPagination(
        larkClient.approval.v4.instance.list,
        payload,
        pageSize
      );
      const codes = responses.flatMap(res => (res?.data?.instance_code_list ?? []));

      for (const code of codes) {
        const instanceResponse = await larkClient.approval.v4.instance.get({
          path: {
            instance_id: code
          }
        });
        const instance = instanceResponse.data;
        const transformedInstance = instanceService.transformInstance(instance);
        const formData = approval.formTransformFunction(instance.form);
        transformedInstance.form_data = JSON.stringify(formData);
        transformedInstances.push(transformedInstance);
      }
    }

    for (const instance of transformedInstances) {
      await db.larksuitInstances.upsert({
        where: {
          instance_code: instance.instance_code
        },
        update: {
          approval_code: instance.approval_code,
          approval_name: instance.approval_name,
          status: instance.status,
          form: instance.form,
          start_time: new Date(instance.start_time),
          end_time: new Date(instance.end_time),
          serial_number: instance.serial_number,
          user_id: instance.user_id,
          uuid: instance.uuid,
          department_id: instance.department_id,
          form_data: instance.form_data
        },
        create: {
          instance_code: instance.instance_code,
          approval_code: instance.approval_code,
          approval_name: instance.approval_name,
          status: instance.status,
          form: instance.form,
          start_time: new Date(instance.start_time),
          end_time: new Date(instance.end_time),
          serial_number: instance.serial_number,
          user_id: instance.user_id,
          uuid: instance.uuid,
          department_id: instance.department_id,
          form_data: instance.form_data
        }
      });
      await instanceService.createOrUpdateUser(instance.user_id, db, env);
    }
  }

  async createOrUpdateUser(userId, db, env) {
    if (!userId) return null;

    let user = await db.larksuite_users.findUnique({
      where: { user_id: userId },
      select: { user_id: true, name: true }
    });

    if (!user) {
      const larkUser = await LarksuiteService.getUserInfo(env, userId);
      if (larkUser) {
        const userData = {
          user_id: larkUser.user_id,
          open_id: larkUser.open_id,
          union_id: larkUser.union_id,
          name: larkUser.name,
          en_name: larkUser.en_name,
          email: larkUser.email,
          enterprise_email: larkUser.enterprise_email,
          gender: larkUser.gender,
          city: larkUser.city,
          country: larkUser.country,
          department_ids: larkUser.department_ids,
          description: larkUser.description,
          employee_no: larkUser.employee_no,
          employee_type: larkUser.employee_type,
          is_tenant_manager: larkUser.is_tenant_manager,
          job_title: larkUser.job_title,
          join_time: larkUser.join_time ? BigInt(larkUser.join_time) : null,
          leader_user_id: larkUser.leader_user_id,
          work_station: larkUser.work_station,
          status_is_activated: larkUser.status?.is_activated,
          status_is_exited: larkUser.status?.is_exited,
          status_is_frozen: larkUser.status?.is_frozen,
          status_is_resigned: larkUser.status?.is_resigned,
          status_is_unjoin: larkUser.status?.is_unjoin,
          avatar: larkUser.avatar
        };
        await db.larksuite_users.create({ data: userData });
      }
    }

    return true;
  }

  transformInstance = (instance) => {
    return {
      instance_code: instance.instance_code,
      approval_code: instance.approval_code,
      approval_name: instance.approval_name,
      status: instance.status,
      form: instance.form,
      start_time: dayjs(Number(instance.start_time)).utc().format("YYYY-MM-DD HH:mm:ss"),
      end_time: dayjs(Number(instance.end_time)).utc().format("YYYY-MM-DD HH:mm:ss"),
      serial_number: instance.serial_number,
      user_id: instance.user_id,
      uuid: instance.uuid,
      department_id: instance.department_id
    };
  };
}
