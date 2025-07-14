import FrappeClient from "src/frappe/frappe-client";
import StringeeClient from "src/stringee/stringee-client";
import { timestampToDatetime } from "src/stringee/utils/datetime";
import { normalizePhoneNumber } from "src/stringee/utils/phone-number";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class CallLogService {
  constructor(
    {
      jemmiaErpBaseUrl,
      jemmiaErpApiKey,
      jemmiaErpApiSecret,
      stringeeApiKeySid,
      stringeeApiKeySecret
    }
  ) {
    this.doctype = "Call Log";
    this.frappeClient = new FrappeClient({ url: jemmiaErpBaseUrl, apiKey: jemmiaErpApiKey, apiSecret: jemmiaErpApiSecret });
    this.stringeeClient = new StringeeClient(stringeeApiKeySid, stringeeApiKeySecret);
    this.stringeeRecordingPrefix = `${this.stringeeClient.baseUrl}/call/recording`;
  }

  static async syncStringeeCallLogs(env) {
    const JEMMIA_ERP_BASE_URL = env.JEMMIA_ERP_BASE_URL;
    const JEMMIA_ERP_API_KEY = env.JEMMIA_ERP_API_KEY;
    const JEMMIA_ERP_API_SECRET = env.JEMMIA_ERP_API_SECRET;
    const STRINGEE_API_KEY_SID = await env.STRINGEE_SID_SECRET.get();
    const STRINGEE_API_KEY_SECRET = await env.STRINGEE_KEY_SECRET.get();

    const currentTimestamp = dayjs.utc().subtract(1, "hour").subtract(5, "minutes").unix();
    const callLogService = new CallLogService(
      {
        jemmiaErpBaseUrl: JEMMIA_ERP_BASE_URL,
        jemmiaErpApiKey: JEMMIA_ERP_API_KEY,
        jemmiaErpApiSecret: JEMMIA_ERP_API_SECRET,
        stringeeApiKeySid: STRINGEE_API_KEY_SID,
        stringeeApiKeySecret: STRINGEE_API_KEY_SECRET
      }
    );
    const callLogs = await callLogService.stringeeClient.getCallLogs({
      page: 1,
      limit: 100,
      from_created_time: currentTimestamp
    });
    for (const callLog of callLogs) {
      const mappedCallLog = callLogService.mapStringeeCallLogFields(callLog);
      await callLogService.frappeClient.upsert(mappedCallLog, "id");
    }
  }

  mapStringeeCallLogFields = (callLog) => {
    const type = callLog.from_internal === 1 ? "Outgoing" : "Incoming";
    const recording_url = callLog.recorded === 1 ? `${this.stringeeRecordingPrefix}/${callLog.id}` : null;

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
