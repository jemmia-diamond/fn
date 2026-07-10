import FrappeClient from "src/frappe/frappe-client";
import VbotClient from "src/telephony/vbot/vbot-client";
import { normalizeToStandardFormat } from "services/utils/phone-utils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

const FIRST_PAGE = 1;

export default class CallLogService {
  constructor(env) {
    this.doctype = "Call Log";
    this.frappeClient = new FrappeClient({ env });
    this.vbotClient = new VbotClient(env);
  }

  async syncVbotCallLogs() {
    const currentTimestamp = dayjs.utc().subtract(1, "hour").subtract(5, "minutes").unix();
    let page = FIRST_PAGE;

    while (true) {
      const callLogs = await this.vbotClient.getCallLogs({ page });
      if (!callLogs?.length) return;

      for (const callLog of callLogs) {
        const callLogUtc = dayjs(callLog.date_create).subtract(7, "hours").unix();
        if (callLogUtc < currentTimestamp) return;

        const mappedCallLog = this.mapVbotCallLogFields(callLog);
        await this.frappeClient.upsert(mappedCallLog, "id");
      }
      page++;
    }
  }

  mapVbotCallLogFields = (callLog) => {
    const id = callLog.group_id || callLog.external_call_id;
    const isIncoming = callLog.type_call === "INCALL";
    const type = isIncoming ? "Incoming" : "Outgoing";

    const from = isIncoming ? callLog.caller?.[0]?.phone : callLog.hotline_number;
    const to = isIncoming ? callLog.hotline_number : callLog.callee?.[0]?.phone;

    const start_time = dayjs(callLog.date_create).subtract(7, "hours").format("YYYY-MM-DD HH:mm:ss");
    const [hrs = 0, mins = 0, secs = 0] = (callLog.duration_call || "0:0:0").split(":").map(Number);
    const duration = hrs * 3600 + mins * 60 + secs;
    const end_time = dayjs(start_time).add(duration, "second").format("YYYY-MM-DD HH:mm:ss");

    const recording_url = callLog.record_file?.[0];

    return {
      doctype: this.doctype,
      id, provider: "vbot",
      from: normalizeToStandardFormat(from), to: normalizeToStandardFormat(to),
      start_time, end_time, duration, type, recording_url
    };
  };
}
