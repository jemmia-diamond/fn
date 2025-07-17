import LarksuiteService from "services/larksuite/lark";
import Database from "services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { APPROVAL_CODES } from "../constant";

dayjs.extend(utc);

export default class InstanceService {
  static async syncInstancesToDatabase(env) {
    const instanceService = new InstanceService(env);
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
    console.log(transformedIntances[0]);
    
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
      uuid: instance.uuid
    }
  }
}
