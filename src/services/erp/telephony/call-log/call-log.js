import FrappeClient from "src/frappe/frappe-client";
import StringeeClient from "src/stringee/stringee-client";
import { timestampToDatetime } from "src/stringee/utils/datetime";
import { normalizePhoneNumber } from "src/stringee/utils/phone-number";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class CallLogService {
  constructor(env) {
    this.doctype = "Call Log";
    this.env = env;
    this.frappeClient = new FrappeClient({ url: env.JEMMIA_ERP_BASE_URL, apiKey: env.JEMMIA_ERP_API_KEY, apiSecret: env.JEMMIA_ERP_API_SECRET });
    this.stringeeClient = new StringeeClient(env.STRINGEE_API_KEY_SID, env.STRINGEE_API_KEY_SECRET);
  }

  static async syncStringeeCallLogs(env) {
    const currentTimestamp = dayjs.utc().subtract(1, "hour").subtract(5, "minutes").unix();
    const callLogService = new CallLogService(env);
    const callLogs = await callLogService.stringeeClient.getCallLogs({
      page: 1,
      limit: 100,
      from_created_time: currentTimestamp
    });
    for (const callLog of callLogs) {
      const mappedCallLog = callLogService.mapStringeeCallLogFields(callLog);
      await callLogService.frappeClient.upsert(mappedCallLog, "id");
      console.log(callLog);
    }
  }

  mapStringeeCallLogFields = (callLog) => {
    const type = callLog.from_internal === 1 ? "Outgoing" : "Incoming";
    const recording_url = callLog.recorded === 1 ? `https://api.stringee.com/v1/call/recording/${callLog.id}` : null;

    return {
      doctype: this.doctype,
      id: callLog.id,
      from: normalizePhoneNumber(callLog.from_number),
      to: normalizePhoneNumber(callLog.to_number),
      start_time: timestampToDatetime(callLog.start_time),
      end_time: timestampToDatetime(callLog.stop_time),
      duration: callLog.answer_duration,
      type: type,
      recording_url: recording_url
    };
  };
}
