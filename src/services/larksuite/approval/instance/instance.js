import LarksuiteService from "services/larksuite/lark";
import Database from "services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { APPROVAL_CODES } from "../constant";

dayjs.extend(utc);

export default class InstanceService {
  static async syncInstancesToDatabase(env) {
    const instanceService = new InstanceService(env);
    const db = Database.instance(env);
    const larkClient = LarksuiteService.createClient(env);
    const timeThreshold = dayjs().utc();
    const startTime = timeThreshold.subtract(1, "day").subtract(1, "hour").unix() * 1000;
    const endTime = timeThreshold.add(12, "hour").unix() * 1000;

    const approvalCodes = [
      APPROVAL_CODES.LEAVE_APPROVAL
    ]

    const instance_codes = [];

    for (const approvalCode of approvalCodes) {
      const response = await larkClient.approval.v4.instance.list({
        params: {
          start_time: startTime,
          end_time: endTime,
          approval_code: approvalCode,
          page_size: 100
        }
      });
      const codes = response.data.instance_code_list;
      instance_codes.push(...codes);
    }

    const instances = [];
    for (const instance_code of instance_codes) {
      const response = await larkClient.approval.v4.instance.get({
        path: {
          instance_id: instance_code
        }
      });
      instances.push(response.data);
    }

    const transformedIntances = instances.map(instance => instanceService.transformInstance(instance));
    
    const values = transformedIntances.map((_instance, idx) => `($${idx * 11 + 1}, $${idx * 11 + 2}, $${idx * 11 + 3}, $${idx * 11 + 4}, $${idx * 11 + 5}, $${idx * 11 + 6}, $${idx * 11 + 7}, $${idx * 11 + 8}, $${idx * 11 + 9}, $${idx * 11 + 10}, $${idx * 11 + 11})`).join(",\n");
    const params = transformedIntances.flatMap(instance => [
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
      instance.department_id
    ]);
    const query = `INSERT INTO larksuite.instances (instance_code, approval_code, approval_name, status, form, start_time, end_time, serial_number, user_id, uuid, department_id)\nVALUES\n${values}\nON CONFLICT (instance_code) \nDO UPDATE SET \
  approval_code = EXCLUDED.approval_code,\n  approval_name = EXCLUDED.approval_name,\n  status = EXCLUDED.status,\n  form = EXCLUDED.form,\n  start_time = EXCLUDED.start_time,\n  end_time = EXCLUDED.end_time,\n  serial_number = EXCLUDED.serial_number,\n  user_id = EXCLUDED.user_id,\n  uuid = EXCLUDED.uuid,\n  department_id = EXCLUDED.department_id`;
    await db.$executeRawUnsafe(query, ...params);
    
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
    }
  }
}
