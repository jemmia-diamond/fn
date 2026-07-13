import FrappeClient from "src/frappe/frappe-client";
import VbotClient from "src/telephony/vbot/vbot-client";
import { normalizeToStandardFormat } from "services/utils/phone-utils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

const ZERO = 0;
const FIRST = 0;
const ONE = 1;
const FIVE = 5;
const ONE_HOUR = 3600;
const ONE_MINUTE = 60;
const FIRST_PAGE = 1;

const normalizeRecordingUrl = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    u.protocol = "https:";
    u.port = "";
    return u.toString();
  } catch {
    return url;
  }
};

export default class CallLogService {
  constructor(env) {
    this.doctype = "Call Log";
    this.frappeClient = new FrappeClient({ env });
    this.vbotClient = new VbotClient(env);
  }

  async syncVbotCallLogs() {
    const currentTimestamp = dayjs.utc().subtract(ONE, "hour").subtract(FIVE, "minutes").unix();
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

    const from = isIncoming ? callLog.caller?.[FIRST]?.phone : callLog.hotline_number;
    const to = isIncoming ? callLog.hotline_number : callLog.callee?.[FIRST]?.phone;

    const start_time = dayjs(callLog.date_create).subtract(7, "hours").format("YYYY-MM-DD HH:mm:ss");
    const [hrs = ZERO, mins = ZERO, secs = ZERO] = (callLog.duration_call || "0:0:0").split(":").map(Number);
    const duration = hrs * ONE_HOUR + mins * ONE_MINUTE + secs;
    const end_time = dayjs(start_time).add(duration, "second").format("YYYY-MM-DD HH:mm:ss");

    const recording_url = normalizeRecordingUrl(callLog.record_file?.[FIRST]);

    return {
      doctype: this.doctype,
      id, provider: "vbot",
      from: normalizeToStandardFormat(from), to: normalizeToStandardFormat(to),
      start_time, end_time, duration, type, recording_url
    };
  };
}
