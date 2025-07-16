import LarksuiteService from "services/larksuite/lark";
import Database from "services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class InstanceService {
  static async syncInstancesToDatabase(env) {
    const larkClient = LarksuiteService.createClient(env);
    const timeThreshold = dayjs().utc();
    const startTime = timeThreshold.subtract(1, "day").subtract(1, "hour").unix() * 1000;
    const endTime = timeThreshold.add(12, "hour").unix() * 1000;
    const instancesIterator = await larkClient.approval.v4.instance.list({
      params: {
        start_time: startTime,
        end_time: endTime,
        approval_code: "01658309-3806-44E0-A077-1B5E164C1C64",
        page_size: 100
      }
    });
    const instance_codes = instancesIterator.data.instance_code_list;
    console.log(instance_codes);
  }
}
