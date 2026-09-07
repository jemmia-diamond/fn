import FrappeClient from "src/frappe/frappe-client";
import VbotClient from "src/telephony/vbot/vbot-client";
import { normalizeToStandardFormat } from "services/utils/phone-utils";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import { TIMEZONE_VIETNAM } from "src/constants";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const FIRST_ITEM = 0;
const FIRST_PAGE = 1;
const DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
const VBOT_DATETIME_FORMAT = "MM/DD/YYYY HH:mm:ss";
const SYNC_LOOKBACK_MINUTES = 10;
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_MINUTE = 60;

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
      .subtract(SYNC_LOOKBACK_MINUTES, "minutes")
      .unix();
    let page = FIRST_PAGE;

    while (true) {
      const callLogs = await this.vbotClient.getCallLogs({ page });
      if (!callLogs?.length) return;

      for (const callLog of callLogs) {
        const callLogUtc = dayjs.tz(callLog.date_create, VBOT_DATETIME_FORMAT, TIMEZONE_VIETNAM).utc().unix();
        if (callLogUtc < currentTimestamp) return;

        const mappedCallLog = this.mapVbotCallLogFields(callLog);
        await this.frappeClient.upsert(mappedCallLog, "id");
      }
      page++;
    }
  }

  mapVbotCallLogFields = (callLog) => {
    const id = callLog.group_id || callLog.external_call_id;
    const allParticipants = [...(callLog.caller || []), ...(callLog.callee || [])];
    const agents = allParticipants.filter((p) => p.member_no);
    const agent = agents.find((p) => p.disposition === "ANSWER") || agents[FIRST_ITEM];
    const agent_id = agent?.member_no;

    const isIncoming = callLog.type_call === "INCALL" || callLog.type_call === "MISSCALL";
    const type = isIncoming ? "Incoming" : "Outgoing";

    const customerPhone = isIncoming
      ? callLog.caller?.[FIRST_ITEM]?.phone
      : callLog.callee?.[FIRST_ITEM]?.phone;

    const from = isIncoming ? customerPhone : callLog.hotline_number;
    const to = isIncoming ? callLog.hotline_number : customerPhone;

    const start_time = dayjs.tz(callLog.date_create, VBOT_DATETIME_FORMAT, TIMEZONE_VIETNAM).utc().format(DATETIME_FORMAT);
    const [hours, minutes, seconds] = (callLog.duration_call || "00:00:00").split(":").map(Number);
    const duration = hours * SECONDS_IN_HOUR + minutes * SECONDS_IN_MINUTE + seconds;
    const end_time = dayjs.utc(start_time).add(duration, "second").format(DATETIME_FORMAT);
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
