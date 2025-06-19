import FrappeClient from "../../../../frappe/frappe-client";
import StringeeClient from "../../../../stringee/stringee-client";
import { timestampToDatetime } from "../../../../stringee/utils/datetime"

export default class CallLogService {
  constructor(env) {
    this.doctype = "Call Log";
    this.env = env;
    this.frappeClient = new FrappeClient({ url: env.JEMMIA_ERP_BASE_URL, apiKey: env.JEMMIA_ERP_API_KEY, apiSecret: env.JEMMIA_ERP_API_SECRET });
    this.stringeeClient = new StringeeClient(env.STRINGEE_API_KEY_SID, env.STRINGEE_API_KEY_SECRET);
  }

  static async syncStringeeCallLogs(env) {
    const callLogService = new CallLogService(env);
    const callLogs = await callLogService.stringeeClient.getCallLogs({
      page: 2,
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
      from: callLog.from_number,
      to: callLog.to_number,
      start_time: timestampToDatetime(callLog.start_time),
      end_time: timestampToDatetime(callLog.stop_time),
      duration: callLog.answer_duration,
      type: type,
      recording_url: recording_url
    }
  }
}
