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

    for (const transformedInstance of transformedInstances) {
      await db.$executeRaw`
        INSERT INTO larksuite.instances (
          instance_code,
          approval_code,
          approval_name,
          status,
          form,
          start_time,
          end_time,
          serial_number,
          user_id,
          uuid,
          department_id,
          form_data
        ) VALUES (
          ${transformedInstance.instance_code},
          ${transformedInstance.approval_code},
          ${transformedInstance.approval_name},
          ${transformedInstance.status},
          ${transformedInstance.form},
          ${transformedInstance.start_time},
          ${transformedInstance.end_time},
          ${transformedInstance.serial_number},
          ${transformedInstance.user_id},
          ${transformedInstance.uuid},
          ${transformedInstance.department_id},
          ${transformedInstance.form_data}
        )
        ON CONFLICT (instance_code) DO UPDATE SET
          approval_code = EXCLUDED.approval_code,
          approval_name = EXCLUDED.approval_name,
          status = EXCLUDED.status,
          form = EXCLUDED.form,
          start_time = EXCLUDED.start_time,
          end_time = EXCLUDED.end_time,
          serial_number = EXCLUDED.serial_number,
          user_id = EXCLUDED.user_id,
          uuid = EXCLUDED.uuid,
          department_id = EXCLUDED.department_id,
          form_data = EXCLUDED.form_data;
      `;
    }
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
