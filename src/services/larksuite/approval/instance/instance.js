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
