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
      APPROVALS.PURCHASE_APPROVAL
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
      const codes = responses.flatMap(res => (res?.data?.instance_code_list ??[]));

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

    const values = transformedInstances.map((_instance, idx) => `($${idx * 12 + 1}, $${idx * 12 + 2}, $${idx * 12 + 3}, $${idx * 12 + 4}, $${idx * 12 + 5}, $${idx * 12 + 6}, $${idx * 12 + 7}, $${idx * 12 + 8}, $${idx * 12 + 9}, $${idx * 12 + 10}, $${idx * 12 + 11}, $${idx * 12 + 12})`).join(",\n");
    const params = transformedInstances.flatMap(instance => [
      instance.instance_code,
      instance.approval_code,
      instance.approval_name,
      instance.status,
      instance.form,
      instance.start_time,
      instance.end_time,
      instance.serial_number,
      instance.user_id,
      instance.uuid,
      instance.department_id,
      instance.form_data
    ]);
    const query = `INSERT INTO larksuite.instances (instance_code, approval_code, approval_name, status, form, start_time, end_time, serial_number, user_id, uuid, department_id, form_data)\nVALUES\n${values}
    ON CONFLICT (instance_code) \n
    DO UPDATE SET \
    approval_code = EXCLUDED.approval_code,\n  approval_name = EXCLUDED.approval_name,\n  status = EXCLUDED.status,\n  form = EXCLUDED.form,\n  start_time = EXCLUDED.start_time,\n  end_time = EXCLUDED.end_time,\n  serial_number = EXCLUDED.serial_number,\n  user_id = EXCLUDED.user_id,\n  uuid = EXCLUDED.uuid,\n  department_id = EXCLUDED.department_id,\n  form_data = EXCLUDED.form_data`;
    await db.$executeRaw(query, ...params);
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
