import FrappeClient from "src/frappe/frappe-client";
import VbotClient from "src/telephony/vbot/vbot-client";
import { normalizeToStandardFormat } from "services/utils/phone-utils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

const FIRST_ITEM = 0;
const FIRST_PAGE = 1;
const UTC_OFFSET_HOURS = 7;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;
const DEFAULT_TIME_VALUE = 0;
const SYNC_LOOKBACK_HOURS = 1;
const SYNC_LOOKBACK_MINUTES = 5;

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
    const currentTimestamp = dayjs
      .utc()
      .subtract(SYNC_LOOKBACK_HOURS, "hour")
      .subtract(SYNC_LOOKBACK_MINUTES, "minutes")
      .unix();
    let page = FIRST_PAGE;

    while (true) {
      const callLogs = await this.vbotClient.getCallLogs({ page });
      if (!callLogs?.length) return;

      for (const callLog of callLogs) {
        const callLogUtc = dayjs(callLog.date_create).subtract(UTC_OFFSET_HOURS, "hours").unix();
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
    const agent_id = isIncoming ? callLog.callee?.[FIRST_ITEM]?.member_no
      : callLog.caller?.[FIRST_ITEM]?.member_no;

    const from = isIncoming ? callLog.caller?.[FIRST_ITEM]?.phone : callLog.hotline_number;
    const to = isIncoming ? callLog.hotline_number : callLog.callee?.[FIRST_ITEM]?.phone;

    const start_time = dayjs(callLog.date_create)
      .subtract(UTC_OFFSET_HOURS, "hours")
      .format("YYYY-MM-DD HH:mm:ss");
    const durationStr = callLog.duration_call || "0:0:0";
    const [hrs = DEFAULT_TIME_VALUE, mins = DEFAULT_TIME_VALUE, secs = DEFAULT_TIME_VALUE] = durationStr
      .split(":").map(Number);

    const duration = hrs * SECONDS_PER_HOUR + mins * SECONDS_PER_MINUTE + secs;
    const end_time = dayjs(start_time).add(duration, "second").format("YYYY-MM-DD HH:mm:ss");
    const recording_url = normalizeRecordingUrl(callLog.record_file?.[FIRST_ITEM]);
    const disposition = String(callLog?.disposition).toLowerCase();

    return {
      doctype: this.doctype,
      id, provider: "vbot",
      from: normalizeToStandardFormat(from), to: normalizeToStandardFormat(to),
      start_time, end_time, duration, type, recording_url, agent_id, disposition
    };
  };
}
